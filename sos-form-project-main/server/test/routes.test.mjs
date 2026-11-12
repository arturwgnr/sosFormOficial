// Teste de ponta a ponta contra um servidor rodando de verdade
// (npm run dev, em outro terminal). Cobre o fluxo completo de
// autenticação, aprovação, permissões e relatórios, incluindo as
// tentativas de acesso sem permissão que devem ser recusadas.
//
// Uso: npm run test:routes (com o servidor já no ar e o banco já
// migrado/seedado).
import test from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:4000";

// --- client HTTP minimalista com cookie jar manual (sem libs novas) ---
function makeClient() {
  let cookie = null;

  async function request(method, path, body) {
    const headers = { "Content-Type": "application/json" };
    if (cookie) headers.Cookie = cookie;

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const setCookie = res.headers.get("set-cookie");
    if (setCookie) cookie = setCookie.split(";")[0];

    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, body: json };
  }

  return {
    get: (path) => request("GET", path),
    post: (path, body) => request("POST", path, body),
    patch: (path, body) => request("PATCH", path, body),
    del: (path, body) => request("DELETE", path, body),
  };
}

function uniqueEmail(label) {
  // minúsculo: o backend normaliza e-mail para lowercase no registro/login.
  return `${label}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@teste.com`.toLowerCase();
}

// --- admin fixo, criado pelo seed (server/.env) ---
const ADMIN_EMAIL = process.env.ADMIN_1_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_1_PASSWORD;

test("health check responde", async () => {
  const anon = makeClient();
  const res = await anon.get("/api/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
});

test("registro cria conta PENDING, e PENDING não consegue logar", async () => {
  const client = makeClient();
  const email = uniqueEmail("funcionario");

  const registerRes = await client.post("/api/auth/register", {
    name: "Funcionário Teste",
    email,
    password: "senha12345",
  });
  assert.equal(registerRes.status, 201);
  assert.equal(registerRes.body.user.status, "PENDING");

  const loginRes = await client.post("/api/auth/login", { email, password: "senha12345" });
  assert.equal(loginRes.status, 403, "login de conta PENDING deveria ser recusado");
});

test("login com senha errada é recusado, e sem sessão as rotas protegidas negam acesso", async () => {
  const client = makeClient();
  const email = uniqueEmail("senhaerrada");
  await client.post("/api/auth/register", { name: "Teste", email, password: "senha12345" });

  const wrongLogin = await client.post("/api/auth/login", { email, password: "senhaERRADA" });
  assert.equal(wrongLogin.status, 401);

  const meRes = await client.get("/api/auth/me");
  assert.equal(meRes.status, 401, "sem sessão, /me deveria negar");

  const reportsRes = await client.get("/api/reports");
  assert.equal(reportsRes.status, 401, "sem sessão, listar relatórios deveria negar");
});

test("limite de tentativas de login bloqueia a conta temporariamente", async () => {
  const client = makeClient();
  const email = uniqueEmail("bloqueio");
  await client.post("/api/auth/register", { name: "Teste Bloqueio", email, password: "senhaCerta1" });

  // LOGIN_MAX_ATTEMPTS do .env.example é 5: erra 5 vezes.
  let lastStatus;
  for (let i = 0; i < 5; i++) {
    const res = await client.post("/api/auth/login", { email, password: "senhaERRADA" });
    lastStatus = res.status;
  }
  assert.equal(lastStatus, 423, "5ª tentativa errada deveria travar a conta (423)");

  // Mesmo com a senha CERTA agora, a conta continua bloqueada pelo lockout.
  const correctButLocked = await client.post("/api/auth/login", { email, password: "senhaCerta1" });
  assert.equal(correctButLocked.status, 423, "conta travada deveria recusar até senha certa");
});

test("funcionário só vê os próprios relatórios; admin aprova, bloqueia e libera permissão", async () => {
  assert.ok(ADMIN_EMAIL && ADMIN_PASSWORD, "defina ADMIN_1_EMAIL/ADMIN_1_PASSWORD no ambiente do teste");

  const admin = makeClient();
  const adminLogin = await admin.post("/api/auth/login", { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  assert.equal(adminLogin.status, 200, "login do admin deveria funcionar");
  assert.equal(adminLogin.body.user.role, "ADMIN");

  // --- funcionário A ---
  const empA = makeClient();
  const emailA = uniqueEmail("empA");
  await empA.post("/api/auth/register", { name: "Funcionário A", email: emailA, password: "senhaA12345" });

  const pendingRes = await admin.get("/api/admin/users/pending");
  assert.equal(pendingRes.status, 200);
  const userA = pendingRes.body.users.find((u) => u.email === emailA);
  assert.ok(userA, "funcionário A deveria aparecer como pendente");

  const approveRes = await admin.post(`/api/admin/users/${userA.id}/approve`);
  assert.equal(approveRes.status, 200);
  assert.equal(approveRes.body.user.status, "ACTIVE");

  const loginA = await empA.post("/api/auth/login", { email: emailA, password: "senhaA12345" });
  assert.equal(loginA.status, 200, "depois de aprovado, login deveria funcionar");

  // Funcionário A cria um relatório.
  const createRes = await empA.post("/api/reports", {
    type: "PALLET",
    data: { client: "Cliente A", city: "Contagem" },
  });
  assert.equal(createRes.status, 201);
  assert.match(createRes.body.report.publicId, /^PAL-\d{4}$/);
  const reportAId = createRes.body.report.id;

  // --- funcionário B ---
  const empB = makeClient();
  const emailB = uniqueEmail("empB");
  await empB.post("/api/auth/register", { name: "Funcionário B", email: emailB, password: "senhaB12345" });
  const pendingRes2 = await admin.get("/api/admin/users/pending");
  const userB = pendingRes2.body.users.find((u) => u.email === emailB);
  await admin.post(`/api/admin/users/${userB.id}/approve`);
  await empB.post("/api/auth/login", { email: emailB, password: "senhaB12345" });

  // B não vê o relatório de A na listagem.
  const listB = await empB.get("/api/reports");
  assert.equal(listB.status, 200);
  assert.ok(
    !listB.body.reports.some((r) => r.id === reportAId),
    "funcionário B não deveria ver relatório de A"
  );

  // B não consegue abrir o relatório de A diretamente.
  const getByB = await empB.get(`/api/reports/${reportAId}`);
  assert.equal(getByB.status, 403, "acesso direto ao relatório de outro usuário deveria ser recusado");

  // B não é admin: rotas de admin devem recusar.
  const adminRouteByB = await empB.get("/api/admin/users");
  assert.equal(adminRouteByB.status, 403, "funcionário não deveria acessar rota de admin");

  // Admin libera "ver todos os relatórios" para B.
  const permRes = await admin.patch(`/api/admin/users/${userB.id}/permissions`, {
    canViewAllReports: true,
  });
  assert.equal(permRes.status, 200);
  assert.equal(permRes.body.user.canViewAllReports, true);

  // Precisa logar de novo: a sessão já existente não reflete a mudança,
  // mas uma nova consulta ao /me (mesma sessão) já busca o usuário atualizado.
  const listB2 = await empB.get("/api/reports");
  assert.ok(
    listB2.body.reports.some((r) => r.id === reportAId),
    "depois da permissão liberada, B deveria ver o relatório de A"
  );

  // Admin bloqueia o funcionário B: sessão dele deve parar de funcionar.
  const blockRes = await admin.post(`/api/admin/users/${userB.id}/block`);
  assert.equal(blockRes.status, 200);
  assert.equal(blockRes.body.user.status, "BLOCKED");

  const meAfterBlock = await empB.get("/api/auth/me");
  assert.equal(meAfterBlock.status, 401, "sessão de usuário bloqueado deveria ser revogada na hora");

  const loginAfterBlock = await empB.post("/api/auth/login", { email: emailB, password: "senhaB12345" });
  assert.equal(loginAfterBlock.status, 403, "login de conta bloqueada deveria ser recusado");
});

test("logout invalida a sessão", async () => {
  const client = makeClient();
  const email = uniqueEmail("logout");
  await client.post("/api/auth/register", { name: "Teste Logout", email, password: "senha12345" });

  const admin = makeClient();
  await admin.post("/api/auth/login", { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const pendingRes = await admin.get("/api/admin/users/pending");
  const user = pendingRes.body.users.find((u) => u.email === email);
  await admin.post(`/api/admin/users/${user.id}/approve`);

  await client.post("/api/auth/login", { email, password: "senha12345" });
  const meOk = await client.get("/api/auth/me");
  assert.equal(meOk.status, 200);

  await client.post("/api/auth/logout");
  const meAfterLogout = await client.get("/api/auth/me");
  assert.equal(meAfterLogout.status, 401, "depois do logout, a sessão não deveria mais funcionar");
});

test("registro recusa e-mail já cadastrado", async () => {
  const client = makeClient();
  const email = uniqueEmail("duplicado");
  const first = await client.post("/api/auth/register", { name: "Original", email, password: "senha12345" });
  assert.equal(first.status, 201);

  const second = await client.post("/api/auth/register", { name: "Duplicado", email, password: "outrasenha" });
  assert.equal(second.status, 409, "segundo registro com mesmo e-mail deveria ser recusado");
});

test("admin recusa cadastro pendente (marca BLOCKED) e gera ID com prefixo correto por tipo", async () => {
  const admin = makeClient();
  await admin.post("/api/auth/login", { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

  // --- recusar cadastro pendente ---
  const rejected = makeClient();
  const emailRejected = uniqueEmail("recusado");
  await rejected.post("/api/auth/register", { name: "Vai ser recusado", email: emailRejected, password: "senha12345" });

  const pendingList = await admin.get("/api/admin/users/pending");
  const userRejected = pendingList.body.users.find((u) => u.email === emailRejected);
  assert.ok(userRejected, "usuário deveria estar pendente antes de recusar");

  const rejectRes = await admin.post(`/api/admin/users/${userRejected.id}/reject`);
  assert.equal(rejectRes.status, 200);
  assert.equal(rejectRes.body.user.status, "BLOCKED", "recusar deveria marcar como BLOCKED");

  const loginRejected = await rejected.post("/api/auth/login", { email: emailRejected, password: "senha12345" });
  assert.equal(loginRejected.status, 403, "conta recusada (BLOCKED) não deveria conseguir logar");

  // --- ID de relatório com prefixo correto por tipo ---
  const emp = makeClient();
  const emailEmp = uniqueEmail("prefixoemp");
  await emp.post("/api/auth/register", { name: "Teste Prefixo", email: emailEmp, password: "senha12345" });
  const pendingList2 = await admin.get("/api/admin/users/pending");
  const userEmp = pendingList2.body.users.find((u) => u.email === emailEmp);
  await admin.post(`/api/admin/users/${userEmp.id}/approve`);
  await emp.post("/api/auth/login", { email: emailEmp, password: "senha12345" });

  const forkliftReport = await emp.post("/api/reports", {
    type: "FORKLIFT",
    data: { client: "Cliente Empilhadeira" },
  });
  assert.equal(forkliftReport.status, 201);
  assert.match(forkliftReport.body.report.publicId, /^EMP-\d{4}$/, "relatório de empilhadeira deveria ter prefixo EMP-");

  // --- relatório inexistente retorna 404 ---
  const notFound = await emp.get("/api/reports/id-que-nao-existe");
  assert.equal(notFound.status, 404);
});

test("validação de entrada recusa corpo inválido", async () => {
  const client = makeClient();

  const badRegister = await client.post("/api/auth/register", { name: "A", email: "nao-e-email", password: "123" });
  assert.equal(badRegister.status, 400);
  assert.ok(Array.isArray(badRegister.body.issues) && badRegister.body.issues.length > 0);
});

test("admin reativa conta bloqueada (unblock) e o login volta a funcionar", async () => {
  const admin = makeClient();
  await admin.post("/api/auth/login", { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

  const emp = makeClient();
  const email = uniqueEmail("unblock");
  await emp.post("/api/auth/register", { name: "Vai ser bloqueado", email, password: "senha12345" });

  const pendingList = await admin.get("/api/admin/users/pending");
  const user = pendingList.body.users.find((u) => u.email === email);
  await admin.post(`/api/admin/users/${user.id}/approve`);
  await admin.post(`/api/admin/users/${user.id}/block`);

  const loginBlocked = await emp.post("/api/auth/login", { email, password: "senha12345" });
  assert.equal(loginBlocked.status, 403, "login de conta bloqueada deveria ser recusado");

  const unblockRes = await admin.post(`/api/admin/users/${user.id}/unblock`);
  assert.equal(unblockRes.status, 200);
  assert.equal(unblockRes.body.user.status, "ACTIVE", "unblock deveria voltar a conta pra ACTIVE");

  const loginAfterUnblock = await emp.post("/api/auth/login", { email, password: "senha12345" });
  assert.equal(loginAfterUnblock.status, 200, "depois do unblock, login deveria funcionar de novo");

  // unblock em usuário inexistente -> 404
  const notFound = await admin.post("/api/admin/users/id-que-nao-existe/unblock");
  assert.equal(notFound.status, 404);
});

test("estatísticas do dashboard (/api/reports/stats) são admin-only e têm o formato esperado", async () => {
  const admin = makeClient();
  await admin.post("/api/auth/login", { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

  const emp = makeClient();
  const email = uniqueEmail("statsemployee");
  await emp.post("/api/auth/register", { name: "Teste Stats", email, password: "senha12345" });
  const pendingList = await admin.get("/api/admin/users/pending");
  const user = pendingList.body.users.find((u) => u.email === email);
  await admin.post(`/api/admin/users/${user.id}/approve`);
  await emp.post("/api/auth/login", { email, password: "senha12345" });

  const statsByEmployee = await emp.get("/api/reports/stats");
  assert.equal(statsByEmployee.status, 403, "funcionário não deveria acessar as estatísticas");

  const statsByAdmin = await admin.get("/api/reports/stats");
  assert.equal(statsByAdmin.status, 200);
  const body = statsByAdmin.body;
  assert.equal(typeof body.totalThisMonth, "number");
  assert.equal(typeof body.byTypeThisMonth.PALLET, "number");
  assert.equal(typeof body.byTypeThisMonth.FORKLIFT, "number");
  assert.ok(Array.isArray(body.byTechnician));
  assert.ok(Array.isArray(body.monthlySeries) && body.monthlySeries.length === 6);
  assert.ok("garantia" in body.serviceTypeBreakdown);
  assert.ok(Array.isArray(body.topClients));
  assert.equal(typeof body.pendingUsersCount, "number");
});

// --- Remoção de usuário (ação administrativa com senha) ---
// Precisa de TEST_ADMIN_ACTIONS_PASSWORD (a senha em texto cujo hash está
// em ADMIN_ACTIONS_PASSWORD_HASH no servidor sob teste).
const ACTIONS_PASSWORD = process.env.TEST_ADMIN_ACTIONS_PASSWORD;

async function loginAs(email, password) {
  const client = makeClient();
  const res = await client.post("/api/auth/login", { email, password });
  assert.equal(res.status, 200, `login de ${email} deveria funcionar`);
  return { client, user: res.body.user };
}

async function createActiveEmployee(admin, label) {
  const emp = makeClient();
  const email = uniqueEmail(label);
  const name = `Técnico ${label}`;
  await emp.post("/api/auth/register", { name, email, password: "senha12345" });
  const pending = await admin.get("/api/admin/users/pending");
  const user = pending.body.users.find((u) => u.email === email);
  await admin.post(`/api/admin/users/${user.id}/approve`);
  const login = await emp.post("/api/auth/login", { email, password: "senha12345" });
  assert.equal(login.status, 200);
  return { emp, user, name, email };
}

test("remover usuário: senha errada recusa, senha certa remove e os relatórios ficam com o nome do técnico", async () => {
  assert.ok(ACTIONS_PASSWORD, "defina TEST_ADMIN_ACTIONS_PASSWORD no ambiente do teste");
  const { client: admin } = await loginAs(ADMIN_EMAIL, ADMIN_PASSWORD);
  const { emp, user, name } = await createActiveEmployee(admin, "removivel");

  const created = await emp.post("/api/reports", { type: "FORKLIFT", data: { client: "Cliente Remoção" } });
  assert.equal(created.status, 201);
  assert.equal(created.body.report.authorName, name, "relatório grava o nome do técnico");
  const reportId = created.body.report.id;

  // sem senha -> 400 (validação)
  const noPassword = await admin.del(`/api/admin/users/${user.id}`, {});
  assert.equal(noPassword.status, 400);

  // senha errada -> 403, usuário continua existindo
  const wrong = await admin.del(`/api/admin/users/${user.id}`, { actionPassword: "senha-errada" });
  assert.equal(wrong.status, 403);
  const stillThere = await admin.get("/api/admin/users");
  assert.ok(stillThere.body.users.some((u) => u.id === user.id), "senha errada não pode remover");

  // funcionário não pode usar a rota, nem com a senha certa
  const byEmployee = await emp.del(`/api/admin/users/${user.id}`, { actionPassword: ACTIONS_PASSWORD });
  assert.equal(byEmployee.status, 403);

  // senha certa -> remove
  const ok = await admin.del(`/api/admin/users/${user.id}`, { actionPassword: ACTIONS_PASSWORD });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.deleted.id, user.id);
  assert.equal(ok.body.keptReports, 1);

  const after = await admin.get("/api/admin/users");
  assert.ok(!after.body.users.some((u) => u.id === user.id), "usuário deveria ter saído do banco");

  // sessão do removido deixou de valer
  const meAfter = await emp.get("/api/auth/me");
  assert.equal(meAfter.status, 401);

  // relatório continua existindo, sem vínculo, com o nome gravado
  const report = await admin.get(`/api/reports/${reportId}`);
  assert.equal(report.status, 200);
  assert.equal(report.body.report.authorId, null);
  assert.equal(report.body.report.authorName, name);

  const stats = await admin.get("/api/reports/stats");
  const row = stats.body.byTechnician.find((t) => t.name === name);
  assert.ok(row && row.removed === true, "técnico removido continua nas estatísticas");

  // remover de novo -> 404
  const again = await admin.del(`/api/admin/users/${user.id}`, { actionPassword: ACTIONS_PASSWORD });
  assert.equal(again.status, 404);
});

test("remover usuário: admin não remove a si mesmo nem outro admin", async () => {
  const { client: admin, user: me } = await loginAs(ADMIN_EMAIL, ADMIN_PASSWORD);

  const self = await admin.del(`/api/admin/users/${me.id}`, { actionPassword: ACTIONS_PASSWORD });
  assert.equal(self.status, 403);

  const users = await admin.get("/api/admin/users");
  const otherAdmin = users.body.users.find((u) => u.role === "ADMIN" && u.id !== me.id);
  assert.ok(otherAdmin, "seed deveria ter outros admins");
  const other = await admin.del(`/api/admin/users/${otherAdmin.id}`, { actionPassword: ACTIONS_PASSWORD });
  assert.equal(other.status, 403);
});

// Por último: deixa as ações administrativas do ADMIN_3 travadas por
// LOGIN_LOCKOUT_MINUTES. Tolerante a rodar de novo dentro desse prazo.
test("senha de ações administrativas tem limite de tentativas", async () => {
  const { client: admin } = await loginAs(process.env.ADMIN_3_EMAIL, process.env.ADMIN_3_PASSWORD);
  const { user } = await createActiveEmployee(admin, "lockout");
  const maxAttempts = Number(process.env.LOGIN_MAX_ATTEMPTS || 5);

  let last;
  for (let i = 0; i < maxAttempts; i++) {
    last = await admin.del(`/api/admin/users/${user.id}`, { actionPassword: `errada-${i}` });
    if (last.status === 423) break;
    assert.equal(last.status, 403);
  }
  assert.equal(last.status, 423, "depois do limite, deveria bloquear");

  // Bloqueado: nem a senha certa passa.
  const blocked = await admin.del(`/api/admin/users/${user.id}`, { actionPassword: ACTIONS_PASSWORD });
  assert.equal(blocked.status, 423);
  const still = await admin.get("/api/admin/users");
  assert.ok(still.body.users.some((u) => u.id === user.id));
});

// Gera o hash bcrypt de uma senha, para colar no .env
// (ex: ADMIN_ACTIONS_PASSWORD_HASH). Uso:
//   npm run hash:password -- "minha-senha"
import { hashPassword } from "../src/utils/password.js";

const plain = process.argv[2];

if (!plain) {
  console.error('Uso: npm run hash:password -- "sua-senha"');
  process.exit(1);
}

if (plain.length < 8) {
  console.error("A senha precisa ter pelo menos 8 caracteres.");
  process.exit(1);
}

const hash = await hashPassword(plain);
console.log("\nCole no .env (aspas simples, o hash contém \"$\"):\n");
console.log(`ADMIN_ACTIONS_PASSWORD_HASH='${hash}'\n`);
console.log("No painel do Render, cole só o valor, sem aspas.\n");

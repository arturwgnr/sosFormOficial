import { PDFDocument, StandardFonts } from "pdf-lib";
import logo from "../assets/sos-logo.png";
import { ReportLayout } from "./pdfLayout";
import { serviceTotal, tripRoundTrip } from "./timeCalc";

const orDash = (v) => (v ? v : "-");

/**
 * @typedef {Object} ForkliftReportData
 * @property {string} id
 * @property {string} client
 * @property {string} city
 * @property {string} call
 * @property {string} model
 * @property {string} serial
 * @property {string} hourMeter
 * @property {string} defect
 * @property {string} cause
 * @property {string} solution
 * @property {Array<{name: string, date: string, from: string, to: string, total: string}>} services
 * @property {Array<{from: string, to: string, km: string, hours: string, total: string}>} trips
 *   Trajeto de ida (from/to em HH:MM, km da ida). hours = duração da ida;
 *   total = ida e volta ("3h · 120 km"), calculado.
 * @property {Array<{qty: string, desc: string}>} materials
 * @property {string} testDone
 * @property {string} reason
 * @property {string} result
 * @property {string} observation
 * @property {string} serviceType
 * @property {string} clientSignature
 * @property {string} sosSignature
 */

const SERVICE_TYPE_LABELS = {
  garantia: "Em garantia",
  contrato: "Contrato",
  "a faturar": "A faturar",
};

/**
 * @param {ForkliftReportData} data
 */
export async function generateForkliftReportPDF(data) {
  const pdfDoc = await PDFDocument.create();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const logoBytes = await fetch(logo).then((res) => res.arrayBuffer());
  const logoImage = await pdfDoc.embedPng(logoBytes);

  const layout = new ReportLayout(pdfDoc, {
    title: "RELATÓRIO DE SERVIÇO - EMPILHADEIRA",
    font,
    fontBold,
    logoImage,
    id: data.id,
    dateLabel: new Date().toLocaleDateString("pt-BR"),
  });

  // --- Campos principais ---
  layout.drawField("Cliente:", data.client);
  layout.drawField("Cidade:", data.city);
  layout.drawField("Chamado:", data.call);
  layout.drawField("Marca/Modelo:", data.model);
  layout.drawField("Matrícula / Nº de série:", data.serial);
  layout.drawField("Horímetro:", data.hourMeter);
  layout.drawField("Defeito apresentado:", data.defect, { isLong: true });
  layout.drawField("Possíveis causas:", data.cause, { isLong: true });
  layout.drawField("Solução:", data.solution, { isLong: true });

  // --- Outros serviços ---
  layout.drawSectionTitle("Outros serviços:");
  // Totais recalculados a partir dos horários. Relatório antigo com texto
  // livre (sem HH:MM válido) cai no valor que foi salvo.
  data.services.forEach((s) => {
    const total = serviceTotal(s) || s.total;
    layout.drawLine(
      `Nome: ${orDash(s.name)} | Data: ${orDash(s.date)} | Das: ${orDash(s.from)} | Até: ${orDash(s.to)} | Total: ${orDash(total)}`
    );
  });
  layout.addGap(8);

  // --- Viagens ---
  layout.drawSectionTitle("Viagens efetuadas:");
  data.trips.forEach((t) => {
    const calc = tripRoundTrip(t);
    layout.drawLine(
      `Trajeto (ida): das ${orDash(t.from)} até ${orDash(t.to)} | Duração: ${orDash(calc.oneWayHours || t.hours)} | KM: ${orDash(calc.oneWayKm || t.km)}`
    );
    layout.drawLine(`Total ida e volta: ${orDash(calc.text || t.total)}`, { indent: 20 });
  });
  layout.addGap(8);

  // --- Materiais ---
  layout.drawSectionTitle("Materiais empregados:");
  data.materials.forEach((m) => {
    layout.drawLine(`Qtd: ${m.qty} | Descrição: ${m.desc}`);
  });
  layout.addGap(8);

  // --- Rodapé do atendimento ---
  layout.drawSectionTitle("Rodapé do atendimento:");
  layout.drawField("Teste efetuado:", data.testDone === "yes" ? "Sim" : "Não");
  layout.drawField("Motivo:", data.reason || "-");
  layout.drawField("Resultado:", data.result === "positivo" ? "Positivo" : "Negativo");
  layout.drawField("Observações:", data.observation, { isLong: true });
  layout.drawField("Tipo de serviço:", SERVICE_TYPE_LABELS[data.serviceType] || data.serviceType);

  // --- Assinaturas (sempre na última página) ---
  await layout.drawSignatures(data.clientSignature, data.sosSignature);

  // --- Rodapé "Página X de Y" (depois de saber quantas páginas existem) ---
  layout.finalize();

  const pdfBytes = await pdfDoc.save();
  const base64 = btoa(
    new Uint8Array(pdfBytes).reduce((acc, byte) => acc + String.fromCharCode(byte), "")
  );

  return `data:application/pdf;base64,${base64}`;
}

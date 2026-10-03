import { PDFDocument, StandardFonts } from "pdf-lib";
import logo from "../assets/sos-logo.png";
import { ReportLayout } from "./pdfLayout";

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
  data.services.forEach((s) => {
    layout.drawLine(
      `Nome: ${s.name} | Data: ${s.date} | Das: ${s.from} | Até: ${s.to} | Total: ${s.total}`
    );
  });
  layout.addGap(8);

  // --- Viagens ---
  layout.drawSectionTitle("Viagens efetuadas:");
  data.trips.forEach((t) => {
    layout.drawLine(
      `De: ${t.from} | Até: ${t.to} | KM: ${t.km} | Horas: ${t.hours} | Total: ${t.total}`
    );
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

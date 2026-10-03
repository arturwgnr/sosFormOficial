import { PDFDocument, StandardFonts } from "pdf-lib";
import logo from "../assets/sos-logo.png";
import { ReportLayout } from "./pdfLayout";

/**
 * @typedef {Object} ReportData
 * @property {string} id
 * @property {string} client
 * @property {string} city
 * @property {string} name
 * @property {string} phone
 * @property {string} model
 * @property {string} email
 * @property {string} defect
 * @property {string} description
 * @property {string} loan
 * @property {string} loanModel
 * @property {string} clientSignature - base64 PNG
 * @property {string} sosSignature - base64 PNG
 */

/**
 * @param {ReportData} data
 */
export async function generatePalletReportPDF(data) {
  const pdfDoc = await PDFDocument.create();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const logoBytes = await fetch(logo).then((res) => res.arrayBuffer());
  const logoImage = await pdfDoc.embedPng(logoBytes);

  const layout = new ReportLayout(pdfDoc, {
    title: "RELATÓRIO DE SERVIÇO - PALETEIRA",
    font,
    fontBold,
    logoImage,
    id: data.id,
    dateLabel: new Date().toLocaleDateString("pt-BR"),
  });

  // --- Campos principais ---
  layout.drawField("Cliente:", data.client);
  layout.drawField("Cidade:", data.city);
  layout.drawField("Nome:", data.name);
  layout.drawField("Tel.:", data.phone);
  layout.drawField("Marca/Modelo:", data.model);
  layout.drawField("E-mail:", data.email || "-");
  layout.drawField("Defeito relatado:", data.defect, { isLong: true });
  layout.drawField("Descrição do serviço:", data.description, { isLong: true });
  layout.drawField("Empréstimo:", data.loan === "yes" ? "Sim" : "Não");
  layout.drawField("Marca/Modelo (empréstimo):", data.loanModel || "-");

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

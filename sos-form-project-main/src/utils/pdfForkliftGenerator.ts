import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import logo from "../assets/sos-logo.png";

// --- Função auxiliar para quebrar linhas ---
function wrapText(text: string, font: any, size: number, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, size);

    if (testWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

// --- Gerador de ID exclusivo para Empilhadeira ---
export function generateForkliftReportId(): string {
  const key = "forklift_id_counter";
  let counter = parseInt(localStorage.getItem(key) || "0", 10);
  counter++;
  localStorage.setItem(key, counter.toString());
  return counter.toString().padStart(4, "0");
}

interface ForkliftReportData {
  id: string;
  client: string;
  city: string;
  call: string;
  model: string;
  serial: string;
  hourMeter: string;
  defect: string;
  cause: string;
  solution: string;
  services: { name: string; date: string; from: string; to: string; total: string }[];
  trips: { from: string; to: string; km: string; hours: string; total: string }[];
  materials: { qty: string; desc: string }[];
  testDone: string;
  reason: string;
  result: string;
  observation: string;
  serviceType: string;
  clientSignature: string;
  sosSignature: string;
}

export async function generateForkliftReportPDF(data: ForkliftReportData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { height, width } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // --- Cabeçalho ---
  const logoBytes = await fetch(logo).then((res) => res.arrayBuffer());
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const logoDims = logoImage.scale(0.15);

  page.drawImage(logoImage, { x: 50, y: height - 115, width: logoDims.width, height: logoDims.height });
  page.drawText("SOS Transpaletes", { x: 140, y: height - 60, size: 20, font: fontBold, color: rgb(0.1, 0.2, 0.5) });
  page.drawText("Rua Sinval Alves da Cunha, 126 - Jardim Bandeirantes", { x: 140, y: height - 80, size: 10, font });
  page.drawText("CEP: 32371-330 - Contagem - Minas Gerais", { x: 140, y: height - 95, size: 10, font });
  page.drawText("Tel: (31) 2559-3533 | (31) 9340-0419", { x: 140, y: height - 110, size: 10, font });

  page.drawText(`ID: ${data.id}`, { x: width - 100, y: height - 60, size: 10, font });

  page.drawLine({
    start: { x: 50, y: height - 125 },
    end: { x: width - 50, y: height - 125 },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });

  page.drawText("RELATÓRIO DE SERVIÇO - EMPILHADEIRA", {
    x: 50,
    y: height - 150,
    size: 14,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.4),
  });

  // --- Campos principais ---
  const fields = [
    { label: "Cliente:", value: data.client },
    { label: "Cidade:", value: data.city },
    { label: "Chamado:", value: data.call },
    { label: "Marca/Modelo:", value: data.model },
    { label: "Matrícula / Nº de série:", value: data.serial },
    { label: "Horímetro:", value: data.hourMeter },
    { label: "Defeito apresentado:", value: data.defect, isLong: true },
    { label: "Possíveis causas:", value: data.cause, isLong: true },
    { label: "Solução:", value: data.solution, isLong: true },
  ];

  let y = height - 180;
  fields.forEach((field) => {
    const labelWidth = fontBold.widthOfTextAtSize(field.label, 11);
    page.drawText(field.label, { x: 50, y, size: 11, font: fontBold });

    const maxWidth = width - 70 - (55 + labelWidth);
    const lines = wrapText(field.value, font, 11, maxWidth);

    lines.forEach((line, i) => {
      page.drawText(line, { x: 55 + labelWidth, y: y - i * 14, size: 11, font });
    });

    y -= field.isLong ? 14 * lines.length + 10 : 20;
  });

  // --- Outros serviços ---
  page.drawText("Outros serviços:", { x: 50, y, font: fontBold, size: 12 });
  y -= 20;
  data.services.forEach((s, idx) => {
    const line = `Nome: ${s.name} | Data: ${s.date} | Das: ${s.from} | Até: ${s.to} | Total: ${s.total}`;
    const lines = wrapText(line, font, 10, width - 100);

    lines.forEach((l, i) => {
      page.drawText(l, { x: 60, y: y - i * 12, font, size: 10 });
    });

    y -= lines.length * 12 + 5;
    if (idx === data.services.length - 1) y -= 8;
  });

  // --- Viagens ---
  page.drawText("Viagens efetuadas:", { x: 50, y, font: fontBold, size: 12 });
  y -= 20;
  data.trips.forEach((t, idx) => {
    const line = `De: ${t.from} | Até: ${t.to} | KM: ${t.km} | Horas: ${t.hours} | Total: ${t.total}`;
    const lines = wrapText(line, font, 10, width - 100);

    lines.forEach((l, i) => {
      page.drawText(l, { x: 60, y: y - i * 12, font, size: 10 });
    });

    y -= lines.length * 12 + 5;
    if (idx === data.trips.length - 1) y -= 8;
  });

  // --- Materiais ---
  page.drawText("Materiais empregados:", { x: 50, y, font: fontBold, size: 12 });
  y -= 20;
  data.materials.forEach((m, idx) => {
    const line = `Qtd: ${m.qty} | Descrição: ${m.desc}`;
    const lines = wrapText(line, font, 10, width - 100);

    lines.forEach((l, i) => {
      page.drawText(l, { x: 60, y: y - i * 12, font, size: 10 });
    });

    y -= lines.length * 12 + 5;
    if (idx === data.materials.length - 1) y -= 8;
  });

  // --- Assinaturas ---
  if (data.clientSignature) {
    const clientSigImage = await pdfDoc.embedPng(data.clientSignature);
    page.drawImage(clientSigImage, { x: 50, y: 120, width: 180, height: 60 });
    page.drawText("Assinatura do Cliente", { x: 50, y: 105, size: 10, font });
  }
  if (data.sosSignature) {
    const sosSigImage = await pdfDoc.embedPng(data.sosSignature);
    page.drawImage(sosSigImage, { x: 320, y: 120, width: 180, height: 60 });
    page.drawText("Assinatura do Responsável (SOS)", { x: 320, y: 105, size: 10, font });
  }

  // --- Rodapé ---
  page.drawLine({ start: { x: 50, y: 70 }, end: { x: width - 50, y: 70 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  page.drawText("Documento gerado digitalmente por SOS Transpaletes", { x: 50, y: 55, size: 8, font, color: rgb(0.3, 0.3, 0.3) });
  page.drawText("Página 1 de 1", { x: width - 100, y: 55, size: 8, font, color: rgb(0.3, 0.3, 0.3) });

  // --- Exporta ---
  const pdfBytes = await pdfDoc.save();
const base64 = btoa(
  new Uint8Array(pdfBytes).reduce((data, byte) => data + String.fromCharCode(byte), "")
);

return `data:application/pdf;base64,${base64}`;
}

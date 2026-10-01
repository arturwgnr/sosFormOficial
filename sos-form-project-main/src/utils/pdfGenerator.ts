import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import logo from "../assets/sos-logo.png";

interface ReportData {
  id: string;
  client: string;
  city: string;
  name: string;
  phone: string;
  model: string;
  email: string;
  defect: string;
  description: string;
  loan: string;
  loanModel: string;
  clientSignature: string; // base64 PNG
  sosSignature: string;    // base64 PNG
}

// Função auxiliar para quebrar linhas
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

export async function generatePalletReportPDF(data: ReportData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { height, width } = page.getSize();

  // Fontes
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // --- Cabeçalho ---
  const logoBytes = await fetch(logo).then((res) => res.arrayBuffer());
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const logoDims = logoImage.scale(0.15);

  page.drawImage(logoImage, {
    x: 50,
    y: height - 115,
    width: logoDims.width,
    height: logoDims.height,
  });

  page.drawText("SOS Transpaletes", {
    x: 140,
    y: height - 60,
    size: 20,
    font: fontBold,
    color: rgb(0.1, 0.2, 0.5),
  });

  page.drawText("Rua Sinval Alves da Cunha, 126 - Jardim Bandeirantes", {
    x: 140,
    y: height - 80,
    size: 10,
    font,
  });
  page.drawText("CEP: 32371-330 - Contagem - Minas Gerais", {
    x: 140,
    y: height - 95,
    size: 10,
    font,
  });
  page.drawText("Tel: (31) 2559-3533 | (31) 9340-0419", {
    x: 140,
    y: height - 110,
    size: 10,
    font,
  });

  page.drawText(`ID: ${data.id}`, {
    x: width - 100,
    y: height - 60,
    size: 10,
    font,
  });

  page.drawLine({
    start: { x: 50, y: height - 125 },
    end: { x: width - 50, y: height - 125 },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });

  page.drawText("RELATÓRIO DE SERVIÇO - PALETEIRA", {
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
    { label: "Nome:", value: data.name },
    { label: "Tel.:", value: data.phone },
    { label: "Marca/Modelo:", value: data.model },
    { label: "E-mail:", value: data.email || "-" },
    { label: "Defeito relatado:", value: data.defect, isLong: true },
    { label: "Descrição do serviço:", value: data.description, isLong: true },
    { label: "Empréstimo:", value: data.loan === "yes" ? "Sim" : "Não" },
    { label: "Marca/Modelo (empréstimo):", value: data.loanModel || "-" },
  ];

  let y = height - 180;
  fields.forEach((field) => {
    // largura do label
    const labelWidth = fontBold.widthOfTextAtSize(field.label, 11);

    // Label
    page.drawText(field.label, {
      x: 50,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    // Valor com quebra de linha se for longo
    const maxWidth = width - 70 - (55 + labelWidth);
    const lines = wrapText(field.value, font, 11, maxWidth);

    lines.forEach((line, i) => {
      page.drawText(line, {
        x: 55 + labelWidth,
        y: y - i * 14,
        size: 11,
        font,
        color: rgb(0, 0, 0),
      });
    });

    y -= field.isLong ? 14 * lines.length + 10 : 20;
  });

  // --- Assinaturas ---
  if (data.clientSignature) {
    const clientSigImage = await pdfDoc.embedPng(data.clientSignature);
    page.drawImage(clientSigImage, {
      x: 50,
      y: 120,
      width: 180,
      height: 60,
    });
    page.drawText("Assinatura do Cliente", {
      x: 50,
      y: 105,
      size: 10,
      font,
    });
  }

  if (data.sosSignature) {
    const sosSigImage = await pdfDoc.embedPng(data.sosSignature);
    page.drawImage(sosSigImage, {
      x: 320,
      y: 120,
      width: 180,
      height: 60,
    });
    page.drawText("Assinatura do Responsável (SOS)", {
      x: 320,
      y: 105,
      size: 10,
      font,
    });
  }

  // --- Rodapé ---
  page.drawLine({
    start: { x: 50, y: 70 },
    end: { x: width - 50, y: 70 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });

  page.drawText("Documento gerado digitalmente por SOS Transpaletes", {
    x: 50,
    y: 55,
    size: 8,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText("Página 1 de 1", {
    x: width - 100,
    y: 55,
    size: 8,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Exporta
  const pdfBytes = await pdfDoc.save();
const base64 = btoa(
  new Uint8Array(pdfBytes).reduce((data, byte) => data + String.fromCharCode(byte), "")
);

return `data:application/pdf;base64,${base64}`;
}

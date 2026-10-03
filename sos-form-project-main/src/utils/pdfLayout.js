// src/utils/pdfLayout.js
//
// Lógica de paginação compartilhada pelos geradores de PDF (Paleteira e
// Empilhadeira): cabeçalho completo só na primeira página, cabeçalho
// reduzido nas seguintes, quebra automática quando o conteúdo não cabe,
// assinaturas na última página e rodapé "Página X de Y" calculado no final.
import { rgb } from "pdf-lib";

export const PAGE_WIDTH = 595;
export const PAGE_HEIGHT = 842;
export const MARGIN = 50;

// Abaixo desta altura (a partir do topo) fica reservado o rodapé.
const BOTTOM_CONTENT_LIMIT = 85;

/** Quebra um texto em linhas que cabem em `maxWidth` com a fonte/tamanho dados. */
export function wrapText(text, font, size, maxWidth) {
  const words = String(text ?? "").split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, size);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

export class ReportLayout {
  /**
   * @param {import("pdf-lib").PDFDocument} pdfDoc
   * @param {{ title: string, font: any, fontBold: any, logoImage: any, id: string, dateLabel: string }} opts
   */
  constructor(pdfDoc, { title, font, fontBold, logoImage, id, dateLabel }) {
    this.pdfDoc = pdfDoc;
    this.title = title;
    this.font = font;
    this.fontBold = fontBold;
    this.logoImage = logoImage;
    this.id = id;
    this.dateLabel = dateLabel;
    this.pages = [];
    this.page = null;
    this.y = 0;
    this._addPage();
  }

  _addPage() {
    const page = this.pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.pages.push(page);
    this.page = page;
    this.y = this._drawHeader(page, this.pages.length === 1);
  }

  _drawHeader(page, isFirstPage) {
    const { height, width } = page.getSize();
    const { font, fontBold, logoImage, title, id, dateLabel } = this;

    if (isFirstPage) {
      const logoDims = logoImage.scale(0.15);
      page.drawImage(logoImage, {
        x: MARGIN,
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

      page.drawText(`ID: ${id}`, { x: width - 150, y: height - 60, size: 10, font });
      page.drawText(`Data: ${dateLabel}`, { x: width - 150, y: height - 75, size: 10, font });

      page.drawLine({
        start: { x: MARGIN, y: height - 125 },
        end: { x: width - MARGIN, y: height - 125 },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7),
      });

      page.drawText(title, {
        x: MARGIN,
        y: height - 150,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.4),
      });

      return height - 180;
    }

    // Cabeçalho reduzido nas páginas seguintes
    page.drawText("SOS Transpaletes (continuação)", {
      x: MARGIN,
      y: height - 40,
      size: 12,
      font: fontBold,
      color: rgb(0.1, 0.2, 0.5),
    });
    page.drawText(`ID: ${id}`, { x: width - 150, y: height - 40, size: 10, font });
    page.drawLine({
      start: { x: MARGIN, y: height - 48 },
      end: { x: width - MARGIN, y: height - 48 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });

    return height - 68;
  }

  /** Quebra para uma nova página se não houver `neededHeight` de espaço livre. */
  ensureSpace(neededHeight) {
    if (this.y - neededHeight < BOTTOM_CONTENT_LIMIT) {
      this._addPage();
    }
  }

  drawSectionTitle(text) {
    this.ensureSpace(20);
    this.page.drawText(text, { x: MARGIN, y: this.y, font: this.fontBold, size: 12 });
    this.y -= 20;
  }

  /** Desenha um campo "Rótulo: valor", quebrando linha se o valor for longo. */
  drawField(label, value, { isLong = false } = {}) {
    const { font, fontBold } = this;
    const labelWidth = fontBold.widthOfTextAtSize(label, 11);
    const maxWidth = PAGE_WIDTH - MARGIN - 20 - (MARGIN + 5 + labelWidth);
    const lines = wrapText(value || "-", font, 11, maxWidth);
    const blockHeight = isLong ? 14 * lines.length + 10 : 20;

    this.ensureSpace(blockHeight);

    this.page.drawText(label, { x: MARGIN, y: this.y, size: 11, font: fontBold, color: rgb(0, 0, 0) });
    lines.forEach((line, i) => {
      this.page.drawText(line, {
        x: MARGIN + 5 + labelWidth,
        y: this.y - i * 14,
        size: 11,
        font,
        color: rgb(0, 0, 0),
      });
    });

    this.y -= blockHeight;
  }

  /** Desenha uma linha de texto simples (usado nos itens de tabelas dinâmicas). */
  drawLine(text, { size = 10, indent = 10 } = {}) {
    const maxWidth = PAGE_WIDTH - MARGIN * 2 - indent;
    const lines = wrapText(text, this.font, size, maxWidth);
    const blockHeight = lines.length * 12 + 5;

    this.ensureSpace(blockHeight);

    lines.forEach((line, i) => {
      this.page.drawText(line, { x: MARGIN + indent, y: this.y - i * 12, font: this.font, size });
    });

    this.y -= blockHeight;
  }

  /** Reserva espaço extra em branco. */
  addGap(height) {
    this.ensureSpace(height);
    this.y -= height;
  }

  /** Desenha as assinaturas (sempre na última página, após todo o conteúdo). */
  async drawSignatures(clientSignature, sosSignature) {
    const boxHeight = 60;
    const blockHeight = boxHeight + 25;

    this.ensureSpace(blockHeight);
    const sigY = this.y - boxHeight;

    if (clientSignature) {
      const img = await this.pdfDoc.embedPng(clientSignature);
      this.page.drawImage(img, { x: MARGIN, y: sigY, width: 180, height: boxHeight });
      this.page.drawText("Assinatura do Cliente", { x: MARGIN, y: sigY - 15, size: 10, font: this.font });
    }
    if (sosSignature) {
      const img = await this.pdfDoc.embedPng(sosSignature);
      this.page.drawImage(img, { x: 320, y: sigY, width: 180, height: boxHeight });
      this.page.drawText("Assinatura do Responsável (SOS)", { x: 320, y: sigY - 15, size: 10, font: this.font });
    }

    this.y = sigY - 35;
  }

  /** Desenha o rodapé "Página X de Y" em todas as páginas. Chamar por último. */
  finalize() {
    const total = this.pages.length;
    this.pages.forEach((page, idx) => {
      const { width } = page.getSize();
      page.drawLine({
        start: { x: MARGIN, y: 70 },
        end: { x: width - MARGIN, y: 70 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      page.drawText("Documento gerado digitalmente por SOS Transpaletes", {
        x: MARGIN,
        y: 55,
        size: 8,
        font: this.font,
        color: rgb(0.3, 0.3, 0.3),
      });
      page.drawText(`Página ${idx + 1} de ${total}`, {
        x: width - 100,
        y: 55,
        size: 8,
        font: this.font,
        color: rgb(0.3, 0.3, 0.3),
      });
    });
  }
}

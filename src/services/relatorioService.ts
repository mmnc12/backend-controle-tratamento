// src/services/relatorioService.ts

import path from 'path';
import fs from 'fs';

// ============================================
// FUNÇÕES PARA REDE BÁSICA
// ============================================

export const gerarCSVRedeBasica = (pacientes: any[]): string => {
  if (!pacientes || pacientes.length === 0) {
    return 'Nenhum dado encontrado';
  }

  const headers = [
    'Nome', 'Ano', 'PSF', 'Localidade', 'Quarteirão', 'Nº Imóvel',
    'Entrega Documento', 'Entrega Medicamento', 'Data Tratamento',
    'Data Revisão', 'Revisão', 'Telefone', 'Observação'
  ];

  const rows = pacientes.map(p => [
    p.nome || '', p.ano || '', p.psf_nome || '', p.localidade_nome || '',
    p.quarteirao || '', p.numero_imovel || '',
    p.entrega_documento === 'S' ? 'Sim' : 'Não',
    p.entrega_medicamento === 'S' ? 'Sim' : 'Não',
    p.data_tratamento ? new Date(p.data_tratamento).toLocaleDateString('pt-BR') : '',
    p.data_revisao ? new Date(p.data_revisao).toLocaleDateString('pt-BR') : '',
    p.revisao === 'S' ? 'Sim' : 'Não',
    p.telefone || '', p.observacao || ''
  ]);

  return [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
};

export const gerarExcelRedeBasica = async (pacientes: any[]): Promise<Buffer> => {
  let XLSX;
  try {
    XLSX = require('xlsx');
  } catch {
    throw new Error('Biblioteca xlsx não instalada.');
  }

  if (!pacientes || pacientes.length === 0) {
    const ws = XLSX.utils.json_to_sheet([{ 'Mensagem': 'Nenhum dado encontrado' }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rede Básica');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  const data = pacientes.map(p => ({
    'Nome': p.nome || '',
    'Ano': p.ano || '',
    'PSF': p.psf_nome || '',
    'Localidade': p.localidade_nome || '',
    'Quarteirão': p.quarteirao || '',
    'Nº Imóvel': p.numero_imovel || '',
    'Entrega Documento': p.entrega_documento === 'S' ? 'Sim' : 'Não',
    'Entrega Medicamento': p.entrega_medicamento === 'S' ? 'Sim' : 'Não',
    'Data Tratamento': p.data_tratamento ? new Date(p.data_tratamento).toLocaleDateString('pt-BR') : '',
    'Data Revisão': p.data_revisao ? new Date(p.data_revisao).toLocaleDateString('pt-BR') : '',
    'Revisão': p.revisao === 'S' ? 'Sim' : 'Não',
    'Telefone': p.telefone || '',
    'Observação': p.observacao || ''
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 30 }, { wch: 10 }, { wch: 25 }, { wch: 25 },
    { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 18 },
    { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 30 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rede Básica');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

export const gerarPDFRedeBasica = async (pacientes: any[]): Promise<Buffer> => {
  let PDFDocument;
  try {
    PDFDocument = require('pdfkit');
  } catch {
    throw new Error('Biblioteca pdfkit não instalada.');
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 30,
        size: 'A4',
        layout: 'landscape'
      });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks as any);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      const cores = {
        primaria: '#0066b3',
        primariaClara: '#e6f0fa',
        primariaEscura: '#004d8c',
        cinzaClaro: '#f5f6fa',
        cinzaBorda: '#dcdde1',
        texto: '#2d3436',
        textoClaro: '#636e72',
        branco: '#ffffff'
      };

      const margin = 30;
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // ============================================
      // CABEÇALHO COM LOGO À ESQUERDA
      // ============================================
      
      let logoLoaded = false;
      try {
        const logoPath = path.join(process.cwd(), 'src', 'assets', 'logo.png');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, margin, 15, { width: 55 });
          logoLoaded = true;
        }
      } catch {
        // Logo não encontrada
      }

      const titleX = logoLoaded ? margin + 70 : margin;
      const titleY = logoLoaded ? 18 : 20;

      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(cores.primariaEscura)
         .text('SECRETARIA MUNICIPAL DE SAÚDE', titleX, titleY, { align: 'left' });

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(cores.primaria)
         .text('SETOR DE ENDEMIAS', titleX, titleY + 20, { align: 'left' });

      const lineY = 55;
      doc.moveTo(margin, lineY)
         .lineTo(pageWidth - margin, lineY)
         .strokeColor(cores.primaria)
         .lineWidth(1.5)
         .stroke();

      // ============================================
      // TÍTULO DO RELATÓRIO (CENTRALIZADO)
      // ============================================

      doc.moveDown(0.8);
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor(cores.texto)
         .text('RELATÓRIO - REDE BÁSICA', { align: 'center' });

      doc.moveDown(0.3);
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor(cores.textoClaro)
         .text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, { align: 'center' });

      doc.moveDown(0.5);

      // ============================================
      // TABELA
      // ============================================

      if (!pacientes || pacientes.length === 0) {
        doc.fontSize(14)
           .fillColor(cores.textoClaro)
           .text('Nenhum dado encontrado.', { align: 'center' });
        doc.end();
        return;
      }

      const startX = margin;
      let y = doc.y;
      const tableWidth = pageWidth - (margin * 2);

      const colunas = [
        { header: 'NOME', width: 0.14 },
        { header: 'ANO', width: 0.05 },
        { header: 'PSF', width: 0.12 },
        { header: 'LOCALIDADE', width: 0.12 },
        { header: 'QUART.', width: 0.06 },
        { header: 'Nº IMÓVEL', width: 0.07 },
        { header: 'ENT. DOC', width: 0.06 },
        { header: 'ENT. MED', width: 0.06 },
        { header: 'DATA TRAT', width: 0.08 },
        { header: 'DATA REVISÃO', width: 0.08 },
        { header: 'REVISÃO', width: 0.06 },
        { header: 'TELEFONE', width: 0.10 },
      ];

      colunas.forEach(col => col.width = col.width * tableWidth);

      const drawTableHeader = (yPos: number) => {
        let x = startX;
        doc.rect(startX, yPos - 4, tableWidth, 24)
           .fill(cores.primaria);
        doc.font('Helvetica-Bold')
           .fontSize(8)
           .fillColor(cores.branco);
        colunas.forEach((col) => {
          doc.text(col.header, x, yPos + 1, {
            width: col.width,
            align: 'center',
            ellipsis: true
          });
          x += col.width;
        });
        return yPos + 24;
      };

      const drawTableRow = (rowData: string[], yPos: number, isAlternate: boolean) => {
        let x = startX;
        if (isAlternate) {
          doc.rect(startX, yPos - 2, tableWidth, 20)
             .fill(cores.primariaClara);
        }
        doc.font('Helvetica')
           .fontSize(7.5)
           .fillColor(cores.texto);
        rowData.forEach((text, index) => {
          doc.text(text, x, yPos, {
            width: colunas[index].width,
            align: 'center',
            ellipsis: true
          });
          x += colunas[index].width;
        });
        return yPos + 20;
      };

      y = drawTableHeader(y);
      
      const maxY = pageHeight - margin - 60;

      pacientes.forEach((p, index) => {
        if (y > maxY && index < pacientes.length - 1) {
          doc.addPage();
          y = 50;
          y = drawTableHeader(y);
        }

        const rowData = [
          p.nome || '',
          String(p.ano || ''),
          p.psf_nome || '',
          p.localidade_nome || '',
          p.quarteirao || '',
          p.numero_imovel || '',
          p.entrega_documento === 'S' ? 'S' : 'N',
          p.entrega_medicamento === 'S' ? 'S' : 'N',
          p.data_tratamento ? new Date(p.data_tratamento).toLocaleDateString('pt-BR') : '',
          p.data_revisao ? new Date(p.data_revisao).toLocaleDateString('pt-BR') : '',
          p.revisao === 'S' ? 'Sim' : 'Não',
          p.telefone || ''
        ];

        y = drawTableRow(rowData, y, index % 2 === 0);
      });

      // ============================================
      // RODAPÉ
      // ============================================

      y += 10;
      doc.moveTo(margin, y)
         .lineTo(pageWidth - margin, y)
         .strokeColor(cores.cinzaBorda)
         .lineWidth(0.5)
         .stroke();

      y += 10;
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor(cores.texto)
         .text(`Total de registros: ${pacientes.length}`, 0, y, { align: 'center' });

      doc.moveDown(0.3);
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor(cores.textoClaro)
         .text('Sistema de Controle de Tratamento - Setor de Endemias', 0, doc.y, { align: 'center' });

      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(7)
           .fillColor(cores.textoClaro)
           .text(`Página ${i + 1} de ${totalPages}`, 0, doc.page.height - 20, { align: 'center' });
      }

      doc.end();
    } catch (error) {
      console.error('❌ Erro na geração do PDF Rede Básica:', error);
      reject(error);
    }
  });
};

// ============================================
// FUNÇÕES PARA ROTINA
// ============================================

export const gerarCSVRotina = (pacientes: any[]): string => {
  if (!pacientes || pacientes.length === 0) {
    return 'Nenhum dado encontrado';
  }

  const headers = [
    'Nome', 'Nº Amostra', 'Ano', 'PSF', 'Localidade',
    'Quarteirão', 'Nº Imóvel', 'Entrega Resultado',
    'Entrega Documento', 'Entrega Medicamento',
    'Data Tratamento', 'Data Revisão', 'Revisão',
    'Telefone', 'Observação'
  ];

  const rows = pacientes.map(p => [
    p.nome || '', p.numero_amostra || '', p.ano || '',
    p.psf_nome || '', p.localidade_nome || '',
    p.quarteirao || '', p.numero_imovel || '',
    p.entrega_resultado === 'S' ? 'Sim' : 'Não',
    p.entrega_documento === 'S' ? 'Sim' : 'Não',
    p.entrega_medicamento === 'S' ? 'Sim' : 'Não',
    p.data_tratamento ? new Date(p.data_tratamento).toLocaleDateString('pt-BR') : '',
    p.data_revisao ? new Date(p.data_revisao).toLocaleDateString('pt-BR') : '',
    p.revisao === 'S' ? 'Sim' : 'Não',
    p.telefone || '', p.observacao || ''
  ]);

  return [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
};

export const gerarExcelRotina = async (pacientes: any[]): Promise<Buffer> => {
  let XLSX;
  try {
    XLSX = require('xlsx');
  } catch {
    throw new Error('Biblioteca xlsx não instalada.');
  }

  if (!pacientes || pacientes.length === 0) {
    const ws = XLSX.utils.json_to_sheet([{ 'Mensagem': 'Nenhum dado encontrado' }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rotina');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  const data = pacientes.map(p => ({
    'Nome': p.nome || '',
    'Nº Amostra': p.numero_amostra || '',
    'Ano': p.ano || '',
    'PSF': p.psf_nome || '',
    'Localidade': p.localidade_nome || '',
    'Quarteirão': p.quarteirao || '',
    'Nº Imóvel': p.numero_imovel || '',
    'Entrega Resultado': p.entrega_resultado === 'S' ? 'Sim' : 'Não',
    'Entrega Documento': p.entrega_documento === 'S' ? 'Sim' : 'Não',
    'Entrega Medicamento': p.entrega_medicamento === 'S' ? 'Sim' : 'Não',
    'Data Tratamento': p.data_tratamento ? new Date(p.data_tratamento).toLocaleDateString('pt-BR') : '',
    'Data Revisão': p.data_revisao ? new Date(p.data_revisao).toLocaleDateString('pt-BR') : '',
    'Revisão': p.revisao === 'S' ? 'Sim' : 'Não',
    'Telefone': p.telefone || '',
    'Observação': p.observacao || ''
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 30 }, { wch: 15 }, { wch: 10 }, { wch: 25 },
    { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 18 },
    { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 18 }, { wch: 30 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rotina');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

export const gerarPDFRotina = async (pacientes: any[]): Promise<Buffer> => {
  let PDFDocument;
  try {
    PDFDocument = require('pdfkit');
  } catch {
    throw new Error('Biblioteca pdfkit não instalada.');
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 30,
        size: 'A4',
        layout: 'landscape'
      });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks as any);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      const cores = {
        primaria: '#0066b3',
        primariaClara: '#e6f0fa',
        primariaEscura: '#004d8c',
        cinzaClaro: '#f5f6fa',
        cinzaBorda: '#dcdde1',
        texto: '#2d3436',
        textoClaro: '#636e72',
        branco: '#ffffff'
      };

      const margin = 30;
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      let logoLoaded = false;
      try {
        const logoPath = path.join(process.cwd(), 'src', 'assets', 'logo.png');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, margin, 15, { width: 55 });
          logoLoaded = true;
        }
      } catch {}

      const titleX = logoLoaded ? margin + 70 : margin;
      const titleY = logoLoaded ? 18 : 20;

      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(cores.primariaEscura)
         .text('SECRETARIA MUNICIPAL DE SAÚDE', titleX, titleY, { align: 'left' });

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(cores.primaria)
         .text('SETOR DE ENDEMIAS', titleX, titleY + 20, { align: 'left' });

      const lineY = 55;
      doc.moveTo(margin, lineY)
         .lineTo(pageWidth - margin, lineY)
         .strokeColor(cores.primaria)
         .lineWidth(1.5)
         .stroke();

      doc.moveDown(0.8);
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor(cores.texto)
         .text('RELATÓRIO - ROTINA', { align: 'center' });

      doc.moveDown(0.3);
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor(cores.textoClaro)
         .text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, { align: 'center' });

      doc.moveDown(0.5);

      if (!pacientes || pacientes.length === 0) {
        doc.fontSize(14)
           .fillColor(cores.textoClaro)
           .text('Nenhum dado encontrado.', { align: 'center' });
        doc.end();
        return;
      }

      const startX = margin;
      let y = doc.y;
      const tableWidth = pageWidth - (margin * 2);

      const colunas = [
        { header: 'NOME', width: 0.12 },
        { header: 'Nº AMOSTRA', width: 0.08 },
        { header: 'ANO', width: 0.05 },
        { header: 'PSF', width: 0.10 },
        { header: 'LOCALIDADE', width: 0.10 },
        { header: 'QUART.', width: 0.06 },
        { header: 'Nº IMÓVEL', width: 0.07 },
        { header: 'ENT. RES.', width: 0.06 },
        { header: 'ENT. DOC', width: 0.06 },
        { header: 'ENT. MED', width: 0.06 },
        { header: 'DATA TRAT', width: 0.08 },
        { header: 'DATA REVISÃO', width: 0.08 },
        { header: 'REVISÃO', width: 0.06 },
        { header: 'TELEFONE', width: 0.08 },
      ];

      colunas.forEach(col => col.width = col.width * tableWidth);

      const drawTableHeader = (yPos: number) => {
        let x = startX;
        doc.rect(startX, yPos - 4, tableWidth, 24)
           .fill(cores.primaria);
        doc.font('Helvetica-Bold')
           .fontSize(7.5)
           .fillColor(cores.branco);
        colunas.forEach((col) => {
          doc.text(col.header, x, yPos + 1, {
            width: col.width,
            align: 'center',
            ellipsis: true
          });
          x += col.width;
        });
        return yPos + 24;
      };

      const drawTableRow = (rowData: string[], yPos: number, isAlternate: boolean) => {
        let x = startX;
        if (isAlternate) {
          doc.rect(startX, yPos - 2, tableWidth, 20)
             .fill(cores.primariaClara);
        }
        doc.font('Helvetica')
           .fontSize(7)
           .fillColor(cores.texto);
        rowData.forEach((text, index) => {
          doc.text(text, x, yPos, {
            width: colunas[index].width,
            align: 'center',
            ellipsis: true
          });
          x += colunas[index].width;
        });
        return yPos + 20;
      };

      y = drawTableHeader(y);
      const maxY = pageHeight - margin - 60;

      pacientes.forEach((p, index) => {
        if (y > maxY && index < pacientes.length - 1) {
          doc.addPage();
          y = 50;
          y = drawTableHeader(y);
        }

        const rowData = [
          p.nome || '',
          p.numero_amostra || '',
          String(p.ano || ''),
          p.psf_nome || '',
          p.localidade_nome || '',
          p.quarteirao || '',
          p.numero_imovel || '',
          p.entrega_resultado === 'S' ? 'S' : 'N',
          p.entrega_documento === 'S' ? 'S' : 'N',
          p.entrega_medicamento === 'S' ? 'S' : 'N',
          p.data_tratamento ? new Date(p.data_tratamento).toLocaleDateString('pt-BR') : '',
          p.data_revisao ? new Date(p.data_revisao).toLocaleDateString('pt-BR') : '',
          p.revisao === 'S' ? 'Sim' : 'Não',
          p.telefone || ''
        ];

        y = drawTableRow(rowData, y, index % 2 === 0);
      });

      y += 10;
      doc.moveTo(margin, y)
         .lineTo(pageWidth - margin, y)
         .strokeColor(cores.cinzaBorda)
         .lineWidth(0.5)
         .stroke();

      y += 10;
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor(cores.texto)
         .text(`Total de registros: ${pacientes.length}`, 0, y, { align: 'center' });

      doc.moveDown(0.3);
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor(cores.textoClaro)
         .text('Sistema de Controle de Tratamento - Setor de Endemias', 0, doc.y, { align: 'center' });

      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(7)
           .fillColor(cores.textoClaro)
           .text(`Página ${i + 1} de ${totalPages}`, 0, doc.page.height - 20, { align: 'center' });
      }

      doc.end();
    } catch (error) {
      console.error('❌ Erro na geração do PDF Rotina:', error);
      reject(error);
    }
  });
};
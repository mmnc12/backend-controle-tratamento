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

    const headers = ['Nome', 'Ano', 'PSF', 'Localidade', 'Quarteirão', 'Nº Imóvel', 'Entrega Documento', 'Entrega Medicamento', 'Data Tratamento', 'Revisão', 'Telefone', 'Observação'];

    const rows = pacientes.map(p => [
        p.nome || '',
        p.ano || '',
        p.psf_nome || '',
        p.localidade_nome || '',
        p.quarteirao || '',
        p.numero_imovel || '',
        p.entrega_documento === 'S' ? 'Sim' : 'Não',
        p.entrega_medicamento === 'S' ? 'Sim' : 'Não',
        p.data_tratamento ? new Date(p.data_tratamento).toLocaleDateString('pt-BR') : '',
        p.revisao === 'S' ? 'Feita' : 'Pendente',
        p.telefone || '',
        p.observacao || ''
    ]);

    return [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
};

export const gerarExcelRedeBasica = async (pacientes: any[]): Promise<Buffer> => {
    let XLSX;
    try {
        XLSX = require('xlsx');
    } catch {
        throw new Error('Biblioteca xlsx não instalada. Execute: npm install xlsx');
    }

    if (!pacientes || pacientes.length === 0) {
        const ws = XLSX.utils.json_to_sheet([{ 'Mensagem': 'Nenhum dado encontrado para os filtros selecionados' }]);
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
        'Revisão': p.revisao === 'S' ? 'Feita' : 'Pendente',
        'Telefone': p.telefone || '',
        'Observação': p.observacao || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const colWidths = [
        { wch: 30 }, { wch: 10 }, { wch: 25 }, { wch: 25 },
        { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 18 },
        { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 30 }
    ];
    ws['!cols'] = colWidths;

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
                margin: 50,
                size: 'A4',
                layout: 'portrait'
            });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk: Buffer) => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks as any);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);

            // ============================================
            // CORES
            // ============================================
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

            // ============================================
            // CABEÇALHO COM LOGO
            // ============================================

            const margin = 50;
            const pageWidth = doc.page.width;

            // 🔥 LOGO - VÁRIAS TENTATIVAS DE CARREGAR
            let logoLoaded = false;

            // Tentativa 1: Caminho relativo ao arquivo atual
            const logoPath1 = path.join(__dirname, '..', 'assets', 'logo.png');
            console.log('📄 Tentando logo em:', logoPath1);

            if (fs.existsSync(logoPath1)) {
                try {
                    doc.image(logoPath1, margin, 25, { width: 70 });
                    logoLoaded = true;
                    console.log('✅ Logo carregada de:', logoPath1);
                } catch (err) {
                    console.log('⚠️ Erro ao carregar logo 1:', err);
                }
            }

            // Tentativa 2: Caminho absoluto (se a primeira falhar)
            if (!logoLoaded) {
                const logoPath2 = path.join(process.cwd(), 'src', 'assets', 'logo.png');
                console.log('📄 Tentando logo em:', logoPath2);

                if (fs.existsSync(logoPath2)) {
                    try {
                        doc.image(logoPath2, margin, 25, { width: 70 });
                        logoLoaded = true;
                        console.log('✅ Logo carregada de:', logoPath2);
                    } catch (err) {
                        console.log('⚠️ Erro ao carregar logo 2:', err);
                    }
                }
            }

            if (!logoLoaded) {
                console.log('⚠️ Logo não encontrada em nenhum caminho!');
            }

            // Título centralizado (com ajuste se a logo existir)
            const titleY = logoLoaded ? 25 : 30;

            doc.fontSize(16)
                .font('Helvetica-Bold')
                .fillColor(cores.primariaEscura)
                .text('SECRETARIA MUNICIPAL DE SAÚDE', 0, titleY, { align: 'center' });

            doc.fontSize(14)
                .font('Helvetica-Bold')
                .fillColor(cores.primaria)
                .text('SETOR DE ENDEMIAS', 0, titleY + 20, { align: 'center' });

            doc.moveDown(1);

            // Linha separadora
            doc.moveTo(margin, 85)
                .lineTo(pageWidth - margin, 85)
                .strokeColor(cores.primaria)
                .lineWidth(2)
                .stroke();

            doc.moveDown(1);

            // Título do relatório
            doc.fontSize(20)
                .font('Helvetica-Bold')
                .fillColor(cores.texto)
                .text('RELATÓRIO - REDE BÁSICA', { align: 'center' });

            doc.moveDown(0.3);

            doc.fontSize(10)
                .font('Helvetica')
                .fillColor(cores.textoClaro)
                .text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, { align: 'center' });

            doc.moveDown(1);

            // ============================================
            // TABELA COM CORES
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
                { header: 'NOME', width: 0.18 },
                { header: 'ANO', width: 0.06 },
                { header: 'PSF', width: 0.15 },
                { header: 'LOCALIDADE', width: 0.15 },
                { header: 'QUART.', width: 0.07 },
                { header: 'Nº IMÓVEL', width: 0.08 },
                { header: 'ENT. DOC', width: 0.07 },
                { header: 'ENT. MED', width: 0.07 },
                { header: 'DATA TRAT', width: 0.09 },
                { header: 'REVISÃO', width: 0.08 },
            ];

            colunas.forEach(col => col.width = col.width * tableWidth);

            // Cabeçalho com fundo azul
            const drawTableHeader = (yPos: number) => {
                let x = startX;

                doc.rect(startX, yPos - 5, tableWidth, 28)
                    .fill(cores.primaria);

                doc.rect(startX, yPos + 23, tableWidth, 1)
                    .fill(cores.primariaEscura);

                doc.font('Helvetica-Bold')
                    .fontSize(9)
                    .fillColor(cores.branco);

                colunas.forEach((col) => {
                    doc.text(col.header, x, yPos + 3, {
                        width: col.width,
                        align: 'center',
                        ellipsis: true
                    });
                    x += col.width;
                });

                return yPos + 28;
            };

            // Linhas com cores alternadas
            const drawTableRow = (rowData: string[], yPos: number, isAlternate: boolean) => {
                let x = startX;

                if (isAlternate) {
                    doc.rect(startX, yPos - 3, tableWidth, 24)
                        .fill(cores.primariaClara);
                }

                doc.rect(startX, yPos + 21, tableWidth, 0.5)
                    .fill(cores.cinzaBorda);

                doc.font('Helvetica')
                    .fontSize(8)
                    .fillColor(cores.texto);

                rowData.forEach((text, index) => {
                    doc.text(text, x, yPos + 1, {
                        width: colunas[index].width,
                        align: 'center',
                        ellipsis: true
                    });
                    x += colunas[index].width;
                });

                return yPos + 24;
            };

            y = drawTableHeader(y);

            pacientes.forEach((p, index) => {
                if (y > 720) {
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
                    p.revisao === 'S' ? 'Sim' : 'Não'
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
                .lineWidth(1)
                .stroke();

            y += 10;

            doc.fontSize(9)
                .font('Helvetica-Bold')
                .fillColor(cores.texto)
                .text(`Total de registros: ${pacientes.length}`, margin, y, { align: 'left' });

            doc.fontSize(8)
                .font('Helvetica')
                .fillColor(cores.textoClaro)
                .text('Sistema de Controle de Tratamento - Setor de Endemias', 0, y, { align: 'right' });

            // Numeração de páginas
            const totalPages = doc.bufferedPageRange().count;
            for (let i = 0; i < totalPages; i++) {
                doc.switchToPage(i);
                doc.fontSize(8)
                    .fillColor(cores.textoClaro)
                    .text(`Página ${i + 1} de ${totalPages}`, margin, doc.page.height - 30, { align: 'center' });
            }

            doc.end();
        } catch (error) {
            console.error('❌ Erro na geração do PDF:', error);
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

    const headers = ['Nome', 'Nº Amostra', 'Ano', 'PSF', 'Localidade', 'Quarteirão', 'Nº Imóvel', 'Entrega Resultado', 'Entrega Documento', 'Entrega Medicamento', 'Data Tratamento', 'Revisão', 'Telefone', 'Observação'];

    const rows = pacientes.map(p => [
        p.nome || '',
        p.numero_amostra || '',
        p.ano || '',
        p.psf_nome || '',
        p.localidade_nome || '',
        p.quarteirao || '',
        p.numero_imovel || '',
        p.entrega_resultado === 'S' ? 'Sim' : 'Não',
        p.entrega_documento === 'S' ? 'Sim' : 'Não',
        p.entrega_medicamento === 'S' ? 'Sim' : 'Não',
        p.data_tratamento ? new Date(p.data_tratamento).toLocaleDateString('pt-BR') : '',
        p.revisao === 'S' ? 'Feita' : 'Pendente',
        p.telefone || '',
        p.observacao || ''
    ]);

    return [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
};

export const gerarExcelRotina = async (pacientes: any[]): Promise<Buffer> => {
    let XLSX;
    try {
        XLSX = require('xlsx');
    } catch {
        throw new Error('Biblioteca xlsx não instalada. Execute: npm install xlsx');
    }

    if (!pacientes || pacientes.length === 0) {
        const ws = XLSX.utils.json_to_sheet([{ 'Mensagem': 'Nenhum dado encontrado para os filtros selecionados' }]);
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
        'Revisão': p.revisao === 'S' ? 'Feita' : 'Pendente',
        'Telefone': p.telefone || '',
        'Observação': p.observacao || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const colWidths = [
        { wch: 30 }, { wch: 15 }, { wch: 10 }, { wch: 25 }, { wch: 25 },
        { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
        { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 30 }
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rotina');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

export const gerarPDFRotina = async (pacientes: any[]): Promise<Buffer> => {
    let PDFDocument;
    try {
        PDFDocument = require('pdfkit');
    } catch {
        throw new Error('Biblioteca pdfkit não instalada. Execute: npm install pdfkit');
    }

    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk: Buffer) => { chunks.push(chunk); });
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks as any);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);

            doc.fontSize(18).text('Relatório - Rotina', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`);
            doc.moveDown();

            if (!pacientes || pacientes.length === 0) {
                doc.fontSize(14).text('Nenhum dado encontrado para os filtros selecionados.', { align: 'center' });
                doc.end();
                return;
            }

            doc.fontSize(10);
            const startX = 50;
            let y = doc.y;
            const colWidths = [180, 70, 50, 120, 120];
            const headers = ['Nome', 'Nº Amostra', 'Ano', 'PSF', 'Localidade'];

            doc.font('Helvetica-Bold');
            let x = startX;
            headers.forEach((header, i) => {
                doc.text(header, x, y, { width: colWidths[i], align: 'left' });
                x += colWidths[i];
            });

            y += 20;
            doc.font('Helvetica');

            pacientes.forEach((p) => {
                if (y > 700) { doc.addPage(); y = 50; }
                x = startX;
                const rowData = [p.nome || '', p.numero_amostra || '', String(p.ano || ''), p.psf_nome || '', p.localidade_nome || ''];
                rowData.forEach((text, i) => {
                    doc.text(text, x, y, { width: colWidths[i], align: 'left' });
                    x += colWidths[i];
                });
                y += 20;
            });

            doc.moveDown();
            doc.fontSize(10).text(`Total de registros: ${pacientes.length}`, { align: 'center' });
            doc.end();
        } catch (error) { reject(error); }
    });
};
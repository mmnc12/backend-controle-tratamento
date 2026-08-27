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

// src/services/relatorioService.ts

// src/services/relatorioService.ts

export const gerarPDFRedeBasica = async (pacientes: any[]): Promise<Buffer> => {
    let PDFDocument;
    try {
        PDFDocument = require('pdfkit');
    } catch {
        throw new Error('Biblioteca pdfkit não instalada.');
    }

    return new Promise((resolve, reject) => {
        try {
            // 🔥 PÁGINA DEITADA
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
            // CABEÇALHO
            // ============================================

            const margin = 30;
            const pageWidth = doc.page.width;
            const centerX = pageWidth / 2;

            // 🔥 LOGO - TENTATIVA COM CAMINHO ABSOLUTO
            try {
                // Caminho absoluto para garantir
                const logoPath = path.join(process.cwd(), 'src', 'assets', 'logo.png');
                console.log('📄 Tentando logo em:', logoPath);

                if (fs.existsSync(logoPath)) {
                    const logoWidth = 60;
                    const logoX = centerX - (logoWidth / 2);
                    doc.image(logoPath, logoX, 15, { width: logoWidth });
                    console.log('✅ Logo carregada com sucesso!');
                } else {
                    console.log('⚠️ Logo não encontrada em:', logoPath);
                }
            } catch (err) {
                console.log('⚠️ Erro ao carregar logo:', err);
            }

            // Títulos centralizados
            doc.fontSize(16)
                .font('Helvetica-Bold')
                .fillColor(cores.primariaEscura)
                .text('SECRETARIA MUNICIPAL DE SAÚDE', 0, 80, { align: 'center' });

            doc.fontSize(14)
                .font('Helvetica-Bold')
                .fillColor(cores.primaria)
                .text('SETOR DE ENDEMIAS', 0, 102, { align: 'center' });

            // Linha separadora
            const lineY = 130;
            doc.moveTo(margin, lineY)
                .lineTo(pageWidth - margin, lineY)
                .strokeColor(cores.primaria)
                .lineWidth(1.5)
                .stroke();

            // ============================================
            // TÍTULO DO RELATÓRIO
            // ============================================

            doc.moveDown(1.5);
            doc.fontSize(18)
                .font('Helvetica-Bold')
                .fillColor(cores.texto)
                .text('RELATÓRIO - REDE BÁSICA', { align: 'center' });

            doc.moveDown(0.5);

            doc.fontSize(10)
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

            // 🔥 COLUNAS
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

            // Cabeçalho
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

            // Linhas
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

            // 🔥 CALCULAR QUANTAS LINHAS CABEM NA PÁGINA
            const headerHeight = 24;
            const rowHeight = 20;
            const maxY = doc.page.height - 80;
            const rowsPerPage = Math.floor((maxY - y) / rowHeight);

            pacientes.forEach((p, index) => {
                // 🔥 VERIFICAR SE PRECISA DE NOVA PÁGINA
                if (y > maxY) {
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

            // Numeração de páginas
            const totalPages = doc.bufferedPageRange().count;
            for (let i = 0; i < totalPages; i++) {
                doc.switchToPage(i);
                doc.fontSize(7)
                    .fillColor(cores.textoClaro)
                    .text(`Página ${i + 1} de ${totalPages}`, 0, doc.page.height - 20, { align: 'center' });
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
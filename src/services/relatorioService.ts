// src/services/relatorioService.ts

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
                primaria: '#0ea5e9',
                primariaEscura: '#0369a1',
                cinzaClaro: '#f1f5f9',
                cinzaBorda: '#e2e8f0',
                texto: '#0f172a',
                textoClaro: '#64748b',
                branco: '#ffffff'
            };

            // ============================================
            // CABEÇALHO
            // ============================================

            // Logo (se tiver a imagem, substitua o caminho)
            try {
                // doc.image('src/assets/logo.png', 50, 30, { width: 60 });
                // Se não tiver logo, comente a linha acima
            } catch {
                // Sem logo, apenas texto
            }

            // Título principal
            doc.fontSize(16)
                .font('Helvetica-Bold')
                .fillColor(cores.primaria)
                .text('SECRETARIA MUNICIPAL DE SAÚDE', { align: 'center' });

            doc.fontSize(14)
                .font('Helvetica-Bold')
                .fillColor(cores.primariaEscura)
                .text('SETOR DE ENDEMIAS', { align: 'center' });

            doc.moveDown(0.5);

            // Título do relatório
            doc.fontSize(18)
                .font('Helvetica-Bold')
                .fillColor(cores.texto)
                .text('RELATÓRIO - REDE BÁSICA', { align: 'center' });

            doc.moveDown(0.3);

            // Data de geração
            doc.fontSize(10)
                .font('Helvetica')
                .fillColor(cores.textoClaro)
                .text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, { align: 'center' });

            doc.moveDown(1);

            // ============================================
            // TABELA
            // ============================================

            if (!pacientes || pacientes.length === 0) {
                doc.fontSize(14)
                    .fillColor(cores.textoClaro)
                    .text('Nenhum dado encontrado para os filtros selecionados.', { align: 'center' });
                doc.end();
                return;
            }

            // Configuração da tabela
            const startX = 50;
            let y = doc.y;
            const pageWidth = doc.page.width - 100;

            // Largura das colunas (proporções)
            const colunas = [
                { header: 'NOME', width: 80 },
                { header: 'ANO', width: 40 },
                { header: 'PSF', width: 80 },
                { header: 'LOCALIDADE', width: 80 },
                { header: 'QUART.', width: 45 },
                { header: 'Nº IMÓVEL', width: 50 },
                { header: 'ENT. DOC', width: 45 },
                { header: 'ENT. MED', width: 45 },
                { header: 'DATA TRAT', width: 60 },
                { header: 'REVISÃO', width: 50 },
            ];

            // Calcular largura total e ajustar
            const totalWidth = colunas.reduce((sum, col) => sum + col.width, 0);
            const scale = pageWidth / totalWidth;
            colunas.forEach(col => col.width = col.width * scale);

            // Função para desenhar cabeçalho da tabela
            const drawTableHeader = (yPos: number) => {
                let x = startX;

                // Fundo do cabeçalho
                doc.rect(startX, yPos - 5, pageWidth, 25)
                    .fill(cores.primaria);

                doc.font('Helvetica-Bold')
                    .fontSize(9)
                    .fillColor(cores.branco);

                colunas.forEach((col) => {
                    doc.text(col.header, x, yPos, {
                        width: col.width,
                        align: 'center',
                        ellipsis: true
                    });
                    x += col.width;
                });

                return yPos + 20;
            };

            // Função para desenhar linha da tabela
            const drawTableRow = (rowData: string[], yPos: number, isAlternate: boolean) => {
                let x = startX;

                // Fundo da linha
                if (isAlternate) {
                    doc.rect(startX, yPos - 5, pageWidth, 20)
                        .fill(cores.cinzaClaro);
                }

                doc.font('Helvetica')
                    .fontSize(8)
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

            // Desenhar cabeçalho
            y = drawTableHeader(y);

            // Desenhar linhas de dados
            pacientes.forEach((p, index) => {
                // Verificar se precisa de nova página
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

            doc.moveDown(1);

            // Linha separadora
            doc.moveTo(50, y + 10)
                .lineTo(doc.page.width - 50, y + 10)
                .stroke(cores.cinzaBorda);

            doc.moveDown(0.5);

            // Total de registros
            doc.fontSize(10)
                .font('Helvetica')
                .fillColor(cores.textoClaro)
                .text(`Total de registros: ${pacientes.length}`, { align: 'center' });

            doc.moveDown(0.3);

            doc.fontSize(8)
                .fillColor(cores.textoClaro)
                .text(`Relatório gerado por Sistema de Controle de Tratamento`, { align: 'center' });

            doc.end();
        } catch (error) {
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
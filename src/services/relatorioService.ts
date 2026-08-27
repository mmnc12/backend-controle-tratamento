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

            doc.fontSize(18).text('Relatório - Rede Básica', { align: 'center' });
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
            const colWidths = [200, 80, 120, 120];
            const headers = ['Nome', 'Ano', 'PSF', 'Localidade'];

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
                const rowData = [p.nome || '', String(p.ano || ''), p.psf_nome || '', p.localidade_nome || ''];
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
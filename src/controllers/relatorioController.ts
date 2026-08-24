import { Request, Response } from 'express';
import { query } from '../config/database';
import ExcelJS from 'exceljs';

// ============================================
// GERAR RELATÓRIO DA REDE BÁSICA EM CSV
// ============================================
export const relatorioRedeBasicaCSV = async (req: Request, res: Response) => {
    try {
        const { localidade_id, psf_id, ano, tratado, revisao } = req.query;

        let sql = `
            SELECT r.*, 
                    l.nome as localidade_nome, 
                    p.nome as psf_nome 
            FROM rede_basica r
            LEFT JOIN localidades l ON r.localidade_id = l.id
            LEFT JOIN psf p ON r.psf_id = p.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (localidade_id) {
            sql += ` AND r.localidade_id = ?`;
            params.push(localidade_id);
        }

        if (psf_id) {
            sql += ` AND r.psf_id = ?`;
            params.push(psf_id);
        }

        if (ano) {
            sql += ` AND r.ano = ?`;
            params.push(ano);
        }

        if (tratado) {
            sql += ` AND r.entrega_medicamento = ?`;
            params.push(tratado);
        }

        if (revisao) {
            sql += ` AND r.revisao = ?`;
            params.push(revisao);
        }

        sql += ` ORDER BY r.nome`;

        const dados = await query<any>(sql, params);

        // CSV com todos os campos exceto ID
        let csv = '\uFEFF'; // BOM para Excel
        csv += 'NOME;ANO;PSF;LOCALIDADE;QUARTEIRÃO;Nº IMÓVEL;ENTREGA DOC;ENTREGA MED;DATA TRATAMENTO;DATA REVISÃO;REVISÃO;TELEFONE;OBSERVAÇÃO\n';

        dados.forEach((r: any) => {
            csv += `${r.nome};${r.ano};${r.psf_nome || ''};${r.localidade_nome || ''};${r.quarteirao || ''};${r.numero_imovel || ''};${r.entrega_documento};${r.entrega_medicamento};${r.data_tratamento || ''};${r.data_revisao || ''};${r.revisao};${r.telefone || ''};${r.observacao || ''}\n`;
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio_rede_basica.csv');
        return res.send(csv);

    } catch (error) {
        console.error('Erro ao gerar CSV:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao gerar relatório CSV'
        });
    }
};

// ============================================
// GERAR RELATÓRIO DA REDE BÁSICA EM EXCEL
// ============================================
export const relatorioRedeBasicaExcel = async (req: Request, res: Response) => {
    try {
        const { localidade_id, psf_id, ano, tratado, revisao } = req.query;

        let sql = `
            SELECT r.*, 
                    l.nome as localidade_nome, 
                    p.nome as psf_nome 
            FROM rede_basica r
            LEFT JOIN localidades l ON r.localidade_id = l.id
            LEFT JOIN psf p ON r.psf_id = p.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (localidade_id) {
            sql += ` AND r.localidade_id = ?`;
            params.push(localidade_id);
        }

        if (psf_id) {
            sql += ` AND r.psf_id = ?`;
            params.push(psf_id);
        }

        if (ano) {
            sql += ` AND r.ano = ?`;
            params.push(ano);
        }

        if (tratado) {
            sql += ` AND r.entrega_medicamento = ?`;
            params.push(tratado);
        }

        if (revisao) {
            sql += ` AND r.revisao = ?`;
            params.push(revisao);
        }

        sql += ` ORDER BY r.nome`;

        const dados = await query<any>(sql, params);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Rede Básica');

        // Cabeçalhos com todos os campos exceto ID
        const headers = ['NOME', 'ANO', 'PSF', 'LOCALIDADE', 'QUARTEIRÃO', 'Nº IMÓVEL', 'ENTREGA DOC', 'ENTREGA MED', 'DATA TRATAMENTO', 'DATA REVISÃO', 'REVISÃO', 'TELEFONE', 'OBSERVAÇÃO'];

        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

        dados.forEach((r: any) => {
            worksheet.addRow([
                r.nome,
                r.ano,
                r.psf_nome || '',
                r.localidade_nome || '',
                r.quarteirao || '',
                r.numero_imovel || '',
                r.entrega_documento,
                r.entrega_medicamento,
                r.data_tratamento || '',
                r.data_revisao || '',
                r.revisao,
                r.telefone || '',
                r.observacao || ''
            ]);
        });

        worksheet.columns.forEach((col: any) => {
            col.width = 20;
        });

        const buffer = await workbook.xlsx.writeBuffer();

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio_rede_basica.xlsx');
        return res.send(buffer);

    } catch (error) {
        console.error('Erro ao gerar Excel:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao gerar relatório Excel'
        });
    }
};

// ============================================
// GERAR RELATÓRIO DA REDE BÁSICA EM PDF
// ============================================
export const relatorioRedeBasicaPDF = async (req: Request, res: Response) => {
    try {
        const { localidade_id, psf_id, ano, tratado, revisao } = req.query;

        let sql = `
            SELECT r.*, 
                    l.nome as localidade_nome, 
                    p.nome as psf_nome 
            FROM rede_basica r
            LEFT JOIN localidades l ON r.localidade_id = l.id
            LEFT JOIN psf p ON r.psf_id = p.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (localidade_id) {
            sql += ` AND r.localidade_id = ?`;
            params.push(localidade_id);
        }

        if (psf_id) {
            sql += ` AND r.psf_id = ?`;
            params.push(psf_id);
        }

        if (ano) {
            sql += ` AND r.ano = ?`;
            params.push(ano);
        }

        if (tratado) {
            sql += ` AND r.entrega_medicamento = ?`;
            params.push(tratado);
        }

        if (revisao) {
            sql += ` AND r.revisao = ?`;
            params.push(revisao);
        }

        sql += ` ORDER BY r.nome`;

        const dados = await query<any>(sql, params);

        const PDFDocument = require('pdfmake');
        const path = require('path');
        const fs = require('fs');

        const pdfMake = new PDFDocument({
            Roboto: {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
                italics: 'Helvetica-Oblique',
                bolditalics: 'Helvetica-BoldOblique'
            }
        });

        // ============================================
        // CARREGAR LOGO DA PASTA ASSETS
        // ============================================
        let logoBase64 = '';
        try {
            const logoPath = path.join(__dirname, '../assets/logo.png');
            if (fs.existsSync(logoPath)) {
                const logoBuffer = fs.readFileSync(logoPath);
                logoBase64 = logoBuffer.toString('base64');
            } else {
                console.warn('⚠️ Logo não encontrada em:', logoPath);
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar logo:', error);
        }

        // ============================================
        // CABEÇALHO: LOGO À ESQUERDA | TÍTULOS CENTRALIZADOS
        // ============================================
        const headerContent = {
            columns: [
                {
                    width: '15%',
                    stack: logoBase64 ? [
                        {
                            image: `data:image/png;base64,${logoBase64}`,
                            width: 50,
                            alignment: 'left',
                            margin: [5, 0, 0, 5]
                        }
                    ] : [],
                    alignment: 'left'
                },
                {
                    width: '70%',
                    stack: [
                        {
                            text: 'SECRETARIA MUNICIPAL DE SAÚDE',
                            alignment: 'center',
                            fontSize: 14,
                            bold: true,
                            margin: [0, 5, 0, 3]
                        },
                        {
                            text: 'SETOR DE ENDEMIAS',
                            alignment: 'center',
                            fontSize: 12,
                            margin: [0, 0, 0, 5]
                        }
                    ],
                    alignment: 'center'
                },
                {
                    width: '15%',
                    text: '',
                    alignment: 'right'
                }
            ],
            margin: [0, 0, 0, 10]
        };

        // ============================================
        // TABELA COM DADOS
        // ============================================
        
        const tableBody: any[][] = [
            [
                'NOME', 
                'ANO', 
                'PSF', 
                'LOCALIDADE', 
                'QUARTEIRÃO', 
                'Nº IMÓVEL', 
                'ENTREGA DOC', 
                'ENTREGA MED', 
                'DATA TRAT', 
                'DATA REVISÃO', 
                'REVISÃO', 
                'TELEFONE', 
                'OBSERVAÇÃO'
            ]
        ];

        dados.forEach((r: any) => {
            tableBody.push([
                r.nome || '',
                String(r.ano || ''),
                r.psf_nome || '',
                r.localidade_nome || '',
                r.quarteirao || '',
                r.numero_imovel || '',
                r.entrega_documento || 'N',
                r.entrega_medicamento || 'N',
                r.data_tratamento ? new Date(r.data_tratamento).toLocaleDateString('pt-BR') : '',
                r.data_revisao ? new Date(r.data_revisao).toLocaleDateString('pt-BR') : '',
                r.revisao || 'N',
                r.telefone || '',
                r.observacao || ''
            ]);
        });

        // ============================================
        // DOCUMENTO DEFINITION
        // ============================================
        const docDefinition: any = {
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [30, 35, 30, 35],
            content: [
                // Cabeçalho
                headerContent,
                
                // LINHA SEPARADORA COMPLETA (de ponta a ponta)
                {
                    canvas: [
                        {
                            type: 'line',
                            x1: 0,          // Começa na margem esquerda
                            y1: 0,
                            x2: 515,        // Vai até a margem direita
                            y2: 0,
                            lineWidth: 1,
                            lineColor: '#999999'
                        }
                    ],
                    margin: [0, 5, 0, 15],
                    // Usar as margens completas para a linha ocupar toda a largura
                    absolutePosition: { x: 30, y: 0 },
                    width: 515
                },

                // Título do relatório
                {
                    text: 'RELATÓRIO - REDE BÁSICA',
                    alignment: 'center',
                    fontSize: 13,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                
                // Data e total
                {
                    columns: [
                        {
                            width: '50%',
                            text: `Data: ${new Date().toLocaleDateString('pt-BR')}`,
                            alignment: 'left',
                            fontSize: 9,
                            margin: [0, 0, 0, 5]
                        },
                        {
                            width: '50%',
                            text: `Total de Pacientes: ${dados.length}`,
                            alignment: 'right',
                            fontSize: 9,
                            margin: [0, 0, 0, 5]
                        }
                    ],
                    margin: [0, 0, 0, 10]
                },

                // Tabela de dados
                {
                    table: {
                        headerRows: 1,
                        widths: [
                            'auto',  // NOME
                            'auto',  // ANO
                            'auto',  // PSF
                            'auto',  // LOCALIDADE
                            'auto',  // QUARTEIRÃO
                            'auto',  // Nº IMÓVEL
                            'auto',  // ENTREGA DOC
                            'auto',  // ENTREGA MED
                            'auto',  // DATA TRAT
                            'auto',  // DATA REVISÃO
                            'auto',  // REVISÃO
                            'auto',  // TELEFONE
                            'auto'   // OBSERVAÇÃO
                        ],
                        body: tableBody
                    },
                    layout: {
                        fillColor: function(rowIndex: number) {
                            return rowIndex === 0 ? '#CCCCCC' : (rowIndex % 2 === 0 ? '#F5F5F5' : null);
                        },
                        hLineWidth: function(_i: number, _node: any) {
                            return 0.5;
                        },
                        vLineWidth: function(_i: number, _node: any) {
                            return 0.5;
                        }
                    }
                },

                // Rodapé
                {
                    text: `Relatório gerado em ${new Date().toLocaleString('pt-BR')}`,
                    alignment: 'center',
                    fontSize: 8,
                    margin: [0, 15, 0, 0],
                    color: '#888888'
                }
            ],
            defaultStyle: {
                fontSize: 7
            }
        };

        const pdfDoc = pdfMake.createPdfKitDocument(docDefinition);
        const chunks: any[] = [];

        pdfDoc.on('data', (chunk: any) => chunks.push(chunk));

        return new Promise((resolve, reject) => {
            pdfDoc.on('end', () => {
                const buffer = Buffer.concat(chunks);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=relatorio_rede_basica.pdf');
                resolve(res.send(buffer));
            });
            pdfDoc.on('error', (err: any) => {
                console.error('Erro ao gerar PDF:', err);
                reject(res.status(500).json({
                    error: 'Erro interno',
                    message: 'Erro ao gerar relatório PDF'
                }));
            });
            pdfDoc.end();
        });

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao gerar relatório PDF'
        });
    }
};

// ============================================
// GERAR RELATÓRIO DA ROTINA EM CSV
// ============================================
export const relatorioRotinaCSV = async (req: Request, res: Response) => {
    try {
        const { localidade_id, psf_id, ano, tratado, revisao, numero_amostra } = req.query;

        let sql = `
            SELECT r.*, 
                    l.nome as localidade_nome, 
                    p.nome as psf_nome 
            FROM rotina r
            LEFT JOIN localidades l ON r.localidade_id = l.id
            LEFT JOIN psf p ON r.psf_id = p.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (numero_amostra) {
            sql += ` AND r.numero_amostra LIKE ?`;
            params.push(`%${numero_amostra}%`);
        }

        if (localidade_id) {
            sql += ` AND r.localidade_id = ?`;
            params.push(localidade_id);
        }

        if (psf_id) {
            sql += ` AND r.psf_id = ?`;
            params.push(psf_id);
        }

        if (ano) {
            sql += ` AND r.ano = ?`;
            params.push(ano);
        }

        if (tratado) {
            sql += ` AND r.entrega_medicamento = ?`;
            params.push(tratado);
        }

        if (revisao) {
            sql += ` AND r.revisao = ?`;
            params.push(revisao);
        }

        sql += ` ORDER BY r.nome`;

        const dados = await query<any>(sql, params);

        // CSV com todos os campos exceto ID
        let csv = '\uFEFF'; // BOM para Excel
        csv += 'NOME;ANO;Nº AMOSTRA;CONTROLE;PSF;LOCALIDADE;QUARTEIRÃO;Nº IMÓVEL;ENTREGA RESULTADO;ENTREGA DOC;ENTREGA MED;DATA TRATAMENTO;DATA REVISÃO;REVISÃO;TELEFONE;OBSERVAÇÃO\n';

        dados.forEach((r: any) => {
            csv += `${r.nome};${r.ano};${r.numero_amostra};${r.controle || ''};${r.psf_nome || ''};${r.localidade_nome || ''};${r.quarteirao || ''};${r.numero_imovel || ''};${r.entrega_resultado};${r.entrega_documento};${r.entrega_medicamento};${r.data_tratamento || ''};${r.data_revisao || ''};${r.revisao};${r.telefone || ''};${r.observacao || ''}\n`;
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio_rotina.csv');
        return res.send(csv);

    } catch (error) {
        console.error('Erro ao gerar CSV:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao gerar relatório CSV'
        });
    }
};
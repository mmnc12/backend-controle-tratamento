// src/controllers/relatorioController.ts

import { Request, Response } from 'express';
import { gerarCSVRedeBasica, gerarExcelRedeBasica, gerarPDFRedeBasica } from '../services/relatorioService';
import {
    gerarCSVRotina,
    gerarExcelRotina,
    gerarPDFRotina
} from '../services/relatorioService';
import { redeBasicaService } from '../services/redeBasicaService';
import { rotinaService } from '../services/rotinaService';

// ============================================
// RELATÓRIOS - REDE BÁSICA
// ============================================

/**
 * Gera relatório CSV da Rede Básica
 */
export const relatorioRedeBasicaCSV = async (req: Request, res: Response) => {
    try {
        const { ano, localidade_id, psf_id, nome } = req.query;

        const pacientes = await redeBasicaService.listar({
            ano: ano ? Number(ano) : undefined,
            localidade_id: localidade_id ? Number(localidade_id) : undefined,
            psf_id: psf_id ? Number(psf_id) : undefined,
            nome: nome as string || undefined
        });

        const csv = await gerarCSVRedeBasica(pacientes);

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio-rede-basica-${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Erro ao gerar CSV Rede Básica:', error);
        res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
};

/**
 * Gera relatório Excel da Rede Básica
 */
export const relatorioRedeBasicaExcel = async (req: Request, res: Response) => {
    try {
        const { ano, localidade_id, psf_id, nome } = req.query;

        const pacientes = await redeBasicaService.listar({
            ano: ano ? Number(ano) : undefined,
            localidade_id: localidade_id ? Number(localidade_id) : undefined,
            psf_id: psf_id ? Number(psf_id) : undefined,
            nome: nome as string || undefined
        });

        const excelBuffer = await gerarExcelRedeBasica(pacientes);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio-rede-basica-${Date.now()}.xlsx`);
        res.send(excelBuffer);
    } catch (error) {
        console.error('Erro ao gerar Excel Rede Básica:', error);
        res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
};

/**
 * Gera relatório PDF da Rede Básica
 */
export const relatorioRedeBasicaPDF = async (req: Request, res: Response) => {
    try {
        const { ano, localidade_id, psf_id, nome } = req.query;

        const pacientes = await redeBasicaService.listar({
            ano: ano ? Number(ano) : undefined,
            localidade_id: localidade_id ? Number(localidade_id) : undefined,
            psf_id: psf_id ? Number(psf_id) : undefined,
            nome: nome as string || undefined
        });

        const pdfBuffer = await gerarPDFRedeBasica(pacientes);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio-rede-basica-${Date.now()}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Erro ao gerar PDF Rede Básica:', error);
        res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
};

// ============================================
// RELATÓRIOS - ROTINA
// ============================================

/**
 * Gera relatório CSV da Rotina
 */
export const relatorioRotinaCSV = async (req: Request, res: Response) => {
    try {
        const { ano, localidade_id, psf_id, nome } = req.query;

        const pacientes = await rotinaService.listar({
            ano: ano ? Number(ano) : undefined,
            localidade_id: localidade_id ? Number(localidade_id) : undefined,
            psf_id: psf_id ? Number(psf_id) : undefined,
            nome: nome as string || undefined
        });

        const csv = await gerarCSVRotina(pacientes);

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio-rotina-${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Erro ao gerar CSV Rotina:', error);
        res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
};

/**
 * Gera relatório Excel da Rotina
 */
export const relatorioRotinaExcel = async (req: Request, res: Response) => {
    try {
        const { ano, localidade_id, psf_id, nome } = req.query;

        const pacientes = await rotinaService.listar({
            ano: ano ? Number(ano) : undefined,
            localidade_id: localidade_id ? Number(localidade_id) : undefined,
            psf_id: psf_id ? Number(psf_id) : undefined,
            nome: nome as string || undefined
        });

        const excelBuffer = await gerarExcelRotina(pacientes);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio-rotina-${Date.now()}.xlsx`);
        res.send(excelBuffer);
    } catch (error) {
        console.error('Erro ao gerar Excel Rotina:', error);
        res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
};

/**
 * Gera relatório PDF da Rotina
 */
export const relatorioRotinaPDF = async (req: Request, res: Response) => {
    try {
        const { ano, localidade_id, psf_id, nome } = req.query;

        const pacientes = await rotinaService.listar({
            ano: ano ? Number(ano) : undefined,
            localidade_id: localidade_id ? Number(localidade_id) : undefined,
            psf_id: psf_id ? Number(psf_id) : undefined,
            nome: nome as string || undefined
        });

        const pdfBuffer = await gerarPDFRotina(pacientes);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio-rotina-${Date.now()}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Erro ao gerar PDF Rotina:', error);
        res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
};
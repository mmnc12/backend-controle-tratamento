// src/controllers/redeBasicaController.ts

import { Request, Response } from 'express';
import { query, queryOne, execute } from '../config/database';

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Calcula o status da revisão:
 * - 'feita'     → tem data_revisao preenchida
 * - 'pendente'  → passou dos 40 dias sem data_revisao
 * - 'no_prazo'  → dentro dos 40 dias sem data_revisao
 * - null        → não tem data_tratamento
 */
const calcularStatusRevisao = (
    dataTratamento: string | Date | null | undefined,
    dataRevisao: string | Date | null | undefined
): 'feita' | 'pendente' | 'no_prazo' | null => {
    if (dataRevisao) {
        return 'feita';
    }

    if (!dataTratamento) {
        return null;
    }

    const dataTrat = new Date(dataTratamento);
    const dataLimite = new Date(dataTrat);
    dataLimite.setDate(dataLimite.getDate() + 40);
    dataLimite.setHours(0, 0, 0, 0);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (hoje > dataLimite) {
        return 'pendente';
    }

    return 'no_prazo';
};

/**
 * Enriquece um registro com campos calculados:
 * - tratado: true/false
 * - status_revisao: 'feita' | 'pendente' | 'no_prazo' | null
 */
const enriquecerRegistro = (registro: any): any => {
    if (!registro) return registro;

    const tratado = Boolean(registro.data_tratamento);
    const status_revisao = calcularStatusRevisao(
        registro.data_tratamento,
        registro.data_revisao
    );

    return {
        ...registro,
        tratado,
        status_revisao
    };
};

/**
 * Sincroniza `revisao` com base em `data_revisao`.
 */
const sincronizarRevisao = (dataRevisao: string | Date | null | undefined): 'S' | 'N' => {
    return dataRevisao ? 'S' : 'N';
};

// ============================================
// VALIDAÇÕES DE NEGÓCIO - REDE BÁSICA
// ============================================

const validarRegrasNegocio = (data: any): string | null => {
    // Regra 1: Não pode haver revisão sem tratamento
    if (data.revisao === 'S' && !data.data_tratamento) {
        return 'Não é possível marcar revisão como feita sem uma data de tratamento';
    }

    // Regra 2: Não pode haver data_revisao sem data_tratamento
    if (data.data_revisao && !data.data_tratamento) {
        return 'Não é possível registrar uma data de revisão sem uma data de tratamento';
    }

    // Regra 3: Não pode haver tratamento sem entrega de medicamento
    if (data.data_tratamento && data.entrega_medicamento !== 'S') {
        return 'Não é possível registrar data de tratamento sem entrega de medicamento';
    }

    // Regra 4: Não pode haver tratamento sem entrega de documento
    if (data.data_tratamento && data.entrega_documento !== 'S') {
        return 'Não é possível registrar data de tratamento sem entrega de documento';
    }

    // Regra 5: Não pode haver data de tratamento no futuro
    if (data.data_tratamento) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataTratamento = new Date(data.data_tratamento);
        dataTratamento.setHours(0, 0, 0, 0);

        if (dataTratamento > hoje) {
            return 'Não é possível registrar uma data de tratamento no futuro';
        }
    }

    return null;
};

// ============================================
// LISTAR PACIENTES COM FILTROS
// ============================================

export const listar = async (req: Request, res: Response) => {
    try {
        const {
            nome,
            localidade_id,
            psf_id,
            ano,
            data_inicio,
            data_fim,
            tratado,
            revisao,
            status_revisao,
            page = 1,
            limit = 20
        } = req.query;

        const pageNumber = parseInt(page as string) || 1;
        const limitNumber = parseInt(limit as string) || 20;
        const offset = (pageNumber - 1) * limitNumber;

        let sql = `
            SELECT r.*,
                    l.nome as localidade_nome,
                    p.nome as psf_nome
            FROM rede_basica r
            LEFT JOIN localidades l ON r.localidade_id = l.id
            LEFT JOIN psf p ON r.psf_id = p.id
            WHERE 1=1
        `;

        let countSql = `SELECT COUNT(*) as total FROM rede_basica r WHERE 1=1`;
        const params: any[] = [];
        const countParams: any[] = [];

        if (nome) {
            sql += ` AND r.nome LIKE ?`;
            countSql += ` AND r.nome LIKE ?`;
            params.push(`%${nome}%`);
            countParams.push(`%${nome}%`);
        }

        if (localidade_id) {
            sql += ` AND r.localidade_id = ?`;
            countSql += ` AND r.localidade_id = ?`;
            params.push(localidade_id);
            countParams.push(localidade_id);
        }

        if (psf_id) {
            sql += ` AND r.psf_id = ?`;
            countSql += ` AND r.psf_id = ?`;
            params.push(psf_id);
            countParams.push(psf_id);
        }

        if (ano) {
            sql += ` AND r.ano = ?`;
            countSql += ` AND r.ano = ?`;
            params.push(ano);
            countParams.push(ano);
        }

        if (data_inicio) {
            sql += ` AND r.data_tratamento >= ?`;
            countSql += ` AND r.data_tratamento >= ?`;
            params.push(data_inicio);
            countParams.push(data_inicio);
        }

        if (data_fim) {
            sql += ` AND r.data_tratamento <= ?`;
            countSql += ` AND r.data_tratamento <= ?`;
            params.push(data_fim);
            countParams.push(data_fim);
        }

        if (tratado) {
            if (tratado === 'S') {
                sql += ` AND r.data_tratamento IS NOT NULL`;
                countSql += ` AND r.data_tratamento IS NOT NULL`;
            } else {
                sql += ` AND r.data_tratamento IS NULL`;
                countSql += ` AND r.data_tratamento IS NULL`;
            }
        }

        if (revisao) {
            sql += ` AND r.revisao = ?`;
            countSql += ` AND r.revisao = ?`;
            params.push(revisao);
            countParams.push(revisao);
        }

        sql += ` ORDER BY r.id DESC LIMIT ? OFFSET ?`;
        params.push(limitNumber, offset);

        const [pacientesRaw, countResult] = await Promise.all([
            query<any>(sql, params),
            queryOne<any>(countSql, countParams)
        ]);

        let pacientes = pacientesRaw.map(enriquecerRegistro);

        if (status_revisao) {
            pacientes = pacientes.filter(
                (p: any) => p.status_revisao === status_revisao
            );
        }

        const total = countResult?.total || 0;
        const totalPages = Math.ceil(total / limitNumber);

        return res.status(200).json({
            success: true,
            data: pacientes,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages,
                hasNext: pageNumber < totalPages,
                hasPrev: pageNumber > 1
            },
            filters: {
                nome,
                localidade_id,
                psf_id,
                ano,
                data_inicio,
                data_fim,
                tratado,
                revisao,
                status_revisao
            }
        });
    } catch (error) {
        console.error('Erro ao listar pacientes:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao buscar pacientes'
        });
    }
};

// ============================================
// BUSCAR PACIENTE POR ID
// ============================================

export const buscarPorId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const paciente = await queryOne<any>(
            `SELECT r.*,
                    l.nome as localidade_nome,
                    p.nome as psf_nome
             FROM rede_basica r
             LEFT JOIN localidades l ON r.localidade_id = l.id
             LEFT JOIN psf p ON r.psf_id = p.id
             WHERE r.id = ?`,
            [id]
        );

        if (!paciente) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'Paciente não encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            data: enriquecerRegistro(paciente)
        });
    } catch (error) {
        console.error('Erro ao buscar paciente:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao buscar paciente'
        });
    }
};

// ============================================
// CRIAR PACIENTE
// ============================================

export const criar = async (req: Request, res: Response) => {
    try {
        const {
            ano,
            nome,
            psf_id,
            localidade_id,
            quarteirao,
            numero_imovel,
            entrega_documento,
            entrega_medicamento,
            data_tratamento,
            data_revisao,
            revisao,
            telefone,
            observacao
        } = req.body;

        if (!ano || !nome || !psf_id || !localidade_id) {
            return res.status(400).json({
                error: 'Campos obrigatórios',
                message: 'Ano, nome, PSF e localidade são obrigatórios'
            });
        }

        const erroValidacao = validarRegrasNegocio({
            revisao,
            data_tratamento,
            data_revisao,
            entrega_medicamento,
            entrega_documento
        });

        if (erroValidacao) {
            return res.status(400).json({
                error: 'Regra de negócio violada',
                message: erroValidacao
            });
        }

        const revisaoSincronizada = sincronizarRevisao(data_revisao);

        const psfExiste = await queryOne<any>(
            'SELECT * FROM psf WHERE id = ?',
            [psf_id]
        );

        if (!psfExiste) {
            return res.status(400).json({
                error: 'PSF inválido',
                message: 'PSF não encontrado'
            });
        }

        const localidadeExiste = await queryOne<any>(
            'SELECT * FROM localidades WHERE id = ?',
            [localidade_id]
        );

        if (!localidadeExiste) {
            return res.status(400).json({
                error: 'Localidade inválida',
                message: 'Localidade não encontrada'
            });
        }

        const result = await execute(
            `INSERT INTO rede_basica
             (ano, nome, psf_id, localidade_id, quarteirao, numero_imovel,
              entrega_documento, entrega_medicamento, data_tratamento, data_revisao,
              revisao, telefone, observacao)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                ano,
                nome,
                psf_id,
                localidade_id,
                quarteirao || null,
                numero_imovel || null,
                entrega_documento || 'N',
                entrega_medicamento || 'N',
                data_tratamento || null,
                data_revisao || null,          // ⚠️ Manual
                revisaoSincronizada,            // ⚠️ Sincronizado
                telefone || null,
                observacao || null
            ]
        );

        const novoPaciente = await queryOne<any>(
            `SELECT r.*,
                    l.nome as localidade_nome,
                    p.nome as psf_nome
             FROM rede_basica r
             LEFT JOIN localidades l ON r.localidade_id = l.id
             LEFT JOIN psf p ON r.psf_id = p.id
             WHERE r.id = ?`,
            [result.insertId]
        );

        return res.status(201).json({
            success: true,
            message: 'Paciente cadastrado com sucesso',
            data: enriquecerRegistro(novoPaciente)
        });
    } catch (error) {
        console.error('Erro ao criar paciente:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao cadastrar paciente'
        });
    }
};

// ============================================
// ATUALIZAR PACIENTE
// ============================================

export const atualizar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            ano,
            nome,
            psf_id,
            localidade_id,
            quarteirao,
            numero_imovel,
            entrega_documento,
            entrega_medicamento,
            data_tratamento,
            data_revisao,
            revisao,
            telefone,
            observacao
        } = req.body;

        const existe = await queryOne<any>(
            'SELECT * FROM rede_basica WHERE id = ?',
            [id]
        );

        if (!existe) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'Paciente não encontrado'
            });
        }

        const dadosAtuais = {
            revisao: revisao !== undefined ? revisao : existe.revisao,
            data_tratamento: data_tratamento !== undefined ? data_tratamento : existe.data_tratamento,
            data_revisao: data_revisao !== undefined ? data_revisao : existe.data_revisao,
            entrega_medicamento: entrega_medicamento !== undefined ? entrega_medicamento : existe.entrega_medicamento,
            entrega_documento: entrega_documento !== undefined ? entrega_documento : existe.entrega_documento
        };

        const erroValidacao = validarRegrasNegocio(dadosAtuais);

        if (erroValidacao) {
            return res.status(400).json({
                error: 'Regra de negócio violada',
                message: erroValidacao
            });
        }

        if (psf_id) {
            const psfExiste = await queryOne<any>(
                'SELECT * FROM psf WHERE id = ?',
                [psf_id]
            );

            if (!psfExiste) {
                return res.status(400).json({
                    error: 'PSF inválido',
                    message: 'PSF não encontrado'
                });
            }
        }

        if (localidade_id) {
            const localidadeExiste = await queryOne<any>(
                'SELECT * FROM localidades WHERE id = ?',
                [localidade_id]
            );

            if (!localidadeExiste) {
                return res.status(400).json({
                    error: 'Localidade inválida',
                    message: 'Localidade não encontrada'
                });
            }
        }

        const dataRevisaoFinal = data_revisao !== undefined
            ? data_revisao
            : existe.data_revisao;

        const revisaoSincronizada = sincronizarRevisao(dataRevisaoFinal);

        await execute(
            `UPDATE rede_basica SET
                ano = ?,
                nome = ?,
                psf_id = ?,
                localidade_id = ?,
                quarteirao = ?,
                numero_imovel = ?,
                entrega_documento = ?,
                entrega_medicamento = ?,
                data_tratamento = ?,
                data_revisao = ?,
                revisao = ?,
                telefone = ?,
                observacao = ?
             WHERE id = ?`,
            [
                ano || existe.ano,
                nome || existe.nome,
                psf_id || existe.psf_id,
                localidade_id || existe.localidade_id,
                quarteirao !== undefined ? quarteirao : existe.quarteirao,
                numero_imovel !== undefined ? numero_imovel : existe.numero_imovel,
                entrega_documento || existe.entrega_documento,
                entrega_medicamento || existe.entrega_medicamento,
                data_tratamento || existe.data_tratamento,
                dataRevisaoFinal,                // ⚠️ Manual
                revisaoSincronizada,             // ⚠️ Sincronizado
                telefone !== undefined ? telefone : existe.telefone,
                observacao !== undefined ? observacao : existe.observacao,
                id
            ]
        );

        const pacienteAtualizado = await queryOne<any>(
            `SELECT r.*,
                    l.nome as localidade_nome,
                    p.nome as psf_nome
             FROM rede_basica r
             LEFT JOIN localidades l ON r.localidade_id = l.id
             LEFT JOIN psf p ON r.psf_id = p.id
             WHERE r.id = ?`,
            [id]
        );

        return res.status(200).json({
            success: true,
            message: 'Paciente atualizado com sucesso',
            data: enriquecerRegistro(pacienteAtualizado)
        });
    } catch (error) {
        console.error('Erro ao atualizar paciente:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao atualizar paciente'
        });
    }
};

// ============================================
// DELETAR PACIENTE
// ============================================

export const deletar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const existe = await queryOne<any>(
            'SELECT * FROM rede_basica WHERE id = ?',
            [id]
        );

        if (!existe) {
            return res.status(404).json({
                error: 'Não encontrado',
                message: 'Paciente não encontrado'
            });
        }

        await execute(
            'DELETE FROM rede_basica WHERE id = ?',
            [id]
        );

        return res.status(200).json({
            success: true,
            message: 'Paciente deletado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao deletar paciente:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao deletar paciente'
        });
    }
};
import { Request, Response } from 'express';
import { query, queryOne, execute } from '../config/database';

// ============================================
// VALIDAÇÕES DE NEGÓCIO - REDE BÁSICA
// ============================================

const validarRegrasNegocio = (data: any): string | null => {
    // Regra 1: Não pode haver revisão sem tratamento
    if (data.revisao === 'S' && !data.data_tratamento) {
        return 'Não é possível marcar revisão como feita sem uma data de tratamento';
    }

    // Regra 2: Não pode haver tratamento sem entrega de medicamento
    if (data.data_tratamento && data.entrega_medicamento !== 'S') {
        return 'Não é possível registrar data de tratamento sem entrega de medicamento';
    }

    // Regra 3: Não pode haver tratamento sem entrega de documento
    if (data.data_tratamento && data.entrega_documento !== 'S') {
        return 'Não é possível registrar data de tratamento sem entrega de documento';
    }

    // Regra 4: Não pode haver data de tratamento no futuro
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
            page = 1,
            limit = 20
        } = req.query;

        const pageNumber = parseInt(page as string) || 1;
        const limitNumber = parseInt(limit as string) || 20;
        const offset = (pageNumber - 1) * limitNumber;

        console.log('📊 Backend - listar rede_basica:');
        console.log('  page:', pageNumber, 'limit:', limitNumber);
        console.log('  nome:', nome);

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

        // ... resto dos filtros

        sql += ` ORDER BY r.id DESC LIMIT ? OFFSET ?`;
        params.push(limitNumber, offset);

        const [pacientes, countResult] = await Promise.all([
            query<any>(sql, params),
            queryOne<any>(countSql, countParams)
        ]);

        const total = countResult?.total || 0;
        const totalPages = Math.ceil(total / limitNumber);

        console.log('  total:', total, 'totalPages:', totalPages);

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
            filters: { nome, localidade_id, psf_id, ano, data_inicio, data_fim, tratado, revisao }
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
            data: paciente
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
            revisao,
            telefone,
            observacao
        } = req.body;

        // Validar campos obrigatórios
        if (!ano || !nome || !psf_id || !localidade_id) {
            return res.status(400).json({
                error: 'Campos obrigatórios',
                message: 'Ano, nome, PSF e localidade são obrigatórios'
            });
        }

        // ============================================
        // VALIDAR REGRAS DE NEGÓCIO
        // ============================================

        const erroValidacao = validarRegrasNegocio({
            revisao,
            data_tratamento,
            entrega_medicamento,
            entrega_documento
        });

        if (erroValidacao) {
            return res.status(400).json({
                error: 'Regra de negócio violada',
                message: erroValidacao
            });
        }

        // Verificar se PSF existe
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

        // Verificar se localidade existe
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

        // Calcular data_revisao (40 dias após data_tratamento)
        let data_revisao = null;
        if (data_tratamento) {
            const data = new Date(data_tratamento);
            data.setDate(data.getDate() + 40);
            data_revisao = data.toISOString().split('T')[0];
        }

        // Inserir
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
                data_revisao,
                revisao || 'N',
                telefone || null,
                observacao || null
            ]
        );

        // Buscar o paciente criado
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
            data: novoPaciente
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
            revisao,
            telefone,
            observacao
        } = req.body;

        // Verificar se existe
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

        // ============================================
        // VALIDAR REGRAS DE NEGÓCIO (com dados atuais)
        // ============================================

        const dadosAtuais = {
            revisao: revisao !== undefined ? revisao : existe.revisao,
            data_tratamento: data_tratamento !== undefined ? data_tratamento : existe.data_tratamento,
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

        // Verificar se PSF existe
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

        // Verificar se localidade existe
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

        // Calcular data_revisao (40 dias após data_tratamento)
        let data_revisao = null;
        if (data_tratamento) {
            const data = new Date(data_tratamento);
            data.setDate(data.getDate() + 40);
            data_revisao = data.toISOString().split('T')[0];
        }

        // Atualizar
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
                data_revisao || existe.data_revisao,
                revisao || existe.revisao,
                telefone !== undefined ? telefone : existe.telefone,
                observacao !== undefined ? observacao : existe.observacao,
                id
            ]
        );

        // Buscar o paciente atualizado
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
            data: pacienteAtualizado
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

        // Verificar se existe
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

        // Deletar
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
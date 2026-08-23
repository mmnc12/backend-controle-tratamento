import { Request, Response } from 'express';
import { query, queryOne, execute } from '../config/database';

// ============================================
// LISTAR PACIENTES COM FILTROS
// ============================================
export const listar = async (req: Request, res: Response) => {
    try {
        // Pegar os parâmetros de filtro da query string
        const {
            nome,
            localidade_id,
            psf_id,
            ano,
            data_inicio,
            data_fim,
            tratado,
            revisao
        } = req.query;

        // Construir a query base
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

        // Filtro por nome (busca parcial)
        if (nome) {
            sql += ` AND r.nome LIKE ?`;
            params.push(`%${nome}%`);
        }

        // Filtro por localidade
        if (localidade_id) {
            sql += ` AND r.localidade_id = ?`;
            params.push(localidade_id);
        }

        // Filtro por PSF
        if (psf_id) {
            sql += ` AND r.psf_id = ?`;
            params.push(psf_id);
        }

        // Filtro por ano
        if (ano) {
            sql += ` AND r.ano = ?`;
            params.push(ano);
        }

        // Filtro por data de tratamento (início)
        if (data_inicio) {
            sql += ` AND r.data_tratamento >= ?`;
            params.push(data_inicio);
        }

        // Filtro por data de tratamento (fim)
        if (data_fim) {
            sql += ` AND r.data_tratamento <= ?`;
            params.push(data_fim);
        }

        // Filtro por tratado (S ou N)
        if (tratado) {
            sql += ` AND r.entrega_medicamento = ?`;
            params.push(tratado);
        }

        // Filtro por revisão (S ou N)
        if (revisao) {
            sql += ` AND r.revisao = ?`;
            params.push(revisao);
        }

        // Ordenação
        sql += ` ORDER BY r.nome`;

        // Executar a query
        const pacientes = await query<any>(sql, params);

        return res.status(200).json({
            success: true,
            data: pacientes,
            total: pacientes.length,
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
// src/services/rotinaService.ts

import pool from '../config/database';

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
// SERVICE
// ============================================

export const rotinaService = {
  listar: async (filtros: any): Promise<any[]> => {
    let query = `
      SELECT r.*,
             p.nome as psf_nome,
             l.nome as localidade_nome
      FROM rotina r
      LEFT JOIN psf p ON r.psf_id = p.id
      LEFT JOIN localidades l ON r.localidade_id = l.id
      WHERE 1=1
    `;
    const values: any[] = [];

    if (filtros.ano) {
      query += ' AND r.ano = ?';
      values.push(filtros.ano);
    }
    if (filtros.localidade_id) {
      query += ' AND r.localidade_id = ?';
      values.push(filtros.localidade_id);
    }
    if (filtros.psf_id) {
      query += ' AND r.psf_id = ?';
      values.push(filtros.psf_id);
    }
    if (filtros.nome) {
      query += ' AND r.nome LIKE ?';
      values.push(`%${filtros.nome}%`);
    }
    if (filtros.tratado) {
      if (filtros.tratado === 'S') {
        query += ' AND r.data_tratamento IS NOT NULL';
      } else {
        query += ' AND r.data_tratamento IS NULL';
      }
    }
    if (filtros.revisao) {
      query += ' AND r.revisao = ?';
      values.push(filtros.revisao);
    }

    query += ' ORDER BY r.id DESC';

    const [rows] = await pool.execute(query, values);

    // ⚠️ Enriquecer cada registro com campos calculados
    return (rows as any[]).map(enriquecerRegistro);
  },

  buscarPorId: async (id: number): Promise<any | null> => {
    const [rows] = await pool.execute(`
      SELECT r.*,
             p.nome as psf_nome,
             l.nome as localidade_nome
      FROM rotina r
      LEFT JOIN psf p ON r.psf_id = p.id
      LEFT JOIN localidades l ON r.localidade_id = l.id
      WHERE r.id = ?
    `, [id]);

    const registro = (rows as any[])[0];
    if (!registro) return null;

    // ⚠️ Enriquecer
    return enriquecerRegistro(registro);
  },

  criar: async (data: any): Promise<any> => {
    // ⚠️ Sincronizar revisao com data_revisao (se data_revisao fornecida)
    const dadosTratados = { ...data };
    if (Object.prototype.hasOwnProperty.call(dadosTratados, 'data_revisao')) {
      dadosTratados.revisao = sincronizarRevisao(dadosTratados.data_revisao);
    }

    const [result] = await pool.execute('INSERT INTO rotina SET ?', [dadosTratados]);
    return result;
  },

  atualizar: async (id: number, data: any): Promise<any> => {
    // ⚠️ Sincronizar revisao com data_revisao (se data_revisao fornecida)
    const dadosTratados = { ...data };
    if (Object.prototype.hasOwnProperty.call(dadosTratados, 'data_revisao')) {
      dadosTratados.revisao = sincronizarRevisao(dadosTratados.data_revisao);
    }

    const [result] = await pool.execute('UPDATE rotina SET ? WHERE id = ?', [dadosTratados, id]);
    return result;
  },

  deletar: async (id: number): Promise<any> => {
    const [result] = await pool.execute('DELETE FROM rotina WHERE id = ?', [id]);
    return result;
  }
};
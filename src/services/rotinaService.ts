// src/services/rotinaService.ts

import pool from '../config/database';

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

    query += ' ORDER BY r.id DESC';

    const [rows] = await pool.execute(query, values);
    return rows as any[];
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
    return (rows as any[])[0] || null;
  },

  criar: async (data: any): Promise<any> => {
    const [result] = await pool.execute('INSERT INTO rotina SET ?', [data]);
    return result;
  },

  atualizar: async (id: number, data: any): Promise<any> => {
    const [result] = await pool.execute('UPDATE rotina SET ? WHERE id = ?', [data, id]);
    return result;
  },

  deletar: async (id: number): Promise<any> => {
    const [result] = await pool.execute('DELETE FROM rotina WHERE id = ?', [id]);
    return result;
  }
};
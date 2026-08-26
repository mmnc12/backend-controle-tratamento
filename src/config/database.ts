import { Pool } from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';

// Forçar resolução IPv4
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

// ⬇️ USAR DATABASE_URL (não as variáveis separadas)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
});

export const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
        console.log(`📊 Banco: ${process.env.DB_NAME || 'postgres'}`);
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar ao banco de dados:', error);
        return false;
    }
};

// ============================================
// FUNÇÕES DE QUERY
// ============================================

export const query = async <T = any>(sql: string, values?: any[]): Promise<T[]> => {
    try {
        const result = await pool.query(sql, values);
        return result.rows as T[];
    } catch (error) {
        console.error('Erro na query:', error);
        throw error;
    }
};

export const queryOne = async <T = any>(sql: string, values?: any[]): Promise<T | null> => {
    try {
        const result = await pool.query(sql, values);
        return result.rows.length > 0 ? result.rows[0] as T : null;
    } catch (error) {
        console.error('Erro na query:', error);
        throw error;
    }
};

export const execute = async (sql: string, values?: any[]): Promise<any> => {
    try {
        const result = await pool.query(sql, values);
        return {
            insertId: result.rows[0]?.id || 0,
            affectedRows: result.rowCount || 0,
            changedRows: result.rowCount || 0
        };
    } catch (error) {
        console.error('Erro na execução:', error);
        throw error;
    }
};

export default pool;
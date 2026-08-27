// src/config/database.ts
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// CONFIGURAÇÃO DO POOL DE CONEXÕES
// ============================================

const pool = mysql.createPool({
    // Usar DATABASE_URL se disponível, senão usar variáveis individuais
    uri: process.env.DATABASE_URL || undefined,
    host: process.env.DATABASE_URL ? undefined : (process.env.DB_HOST || 'localhost'),
    port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DATABASE_URL ? undefined : (process.env.DB_USER || 'root'),
    password: process.env.DATABASE_URL ? undefined : (process.env.DB_PASSWORD || ''),
    database: process.env.DATABASE_URL ? undefined : (process.env.DB_NAME || 'test'),
    
    // SSL (necessário para Clever Cloud)
    ssl: {
        rejectUnauthorized: false
    },
    
    // 🔥 CONFIGURAÇÕES CRÍTICAS PARA CLEVER CLOUD
    waitForConnections: true,
    connectionLimit: 3,        // Clever Cloud DEV: máximo 5 conexões
    queueLimit: 10,            // Aguardar em fila se todas conexões estiverem ocupadas
    connectTimeout: 10000,     // Timeout de conexão: 10 segundos
    idleTimeout: 30000,        // Fechar conexões ociosas após 30 segundos
    enableKeepAlive: true,     // Manter conexões ativas
    keepAliveInitialDelay: 0,  // Sem delay inicial
});

// ============================================
// TESTE DE CONEXÃO
// ============================================

export const testConnection = async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
        
        // Mostrar informações do banco
        const [rows] = await connection.execute('SELECT DATABASE() as db_name, VERSION() as version');
        console.log(`📊 Banco: ${(rows as any[])[0]?.db_name || 'MySQL'}`);
        console.log(`📊 Versão: ${(rows as any[])[0]?.version || 'Desconhecida'}`);
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar ao banco de dados:', error);
        return false;
    } finally {
        if (connection) connection.release(); // 🔥 SEMPRE LIBERAR
    }
};

// ============================================
// FUNÇÕES DE QUERY (COM LIBERAÇÃO DE CONEXÃO)
// ============================================

/**
 * Executa uma query SELECT e retorna todas as linhas
 */
export const query = async <T = any>(sql: string, values?: any[]): Promise<T[]> => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(sql, values);
        return rows as T[];
    } catch (error) {
        console.error('❌ Erro na query:', error);
        throw error;
    } finally {
        if (connection) connection.release(); // 🔥 SEMPRE LIBERAR
    }
};

/**
 * Executa uma query SELECT e retorna apenas a primeira linha
 */
export const queryOne = async <T = any>(sql: string, values?: any[]): Promise<T | null> => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(sql, values);
        const result = (rows as any[]);
        return result.length > 0 ? result[0] as T : null;
    } catch (error) {
        console.error('❌ Erro na queryOne:', error);
        throw error;
    } finally {
        if (connection) connection.release(); // 🔥 SEMPRE LIBERAR
    }
};

/**
 * Executa INSERT, UPDATE ou DELETE
 */
export const execute = async (sql: string, values?: any[]): Promise<any> => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(sql, values);
        return {
            insertId: (result as any).insertId || 0,
            affectedRows: (result as any).affectedRows || 0,
            changedRows: (result as any).changedRows || 0,
            warningCount: (result as any).warningCount || 0
        };
    } catch (error) {
        console.error('❌ Erro na execução:', error);
        throw error;
    } finally {
        if (connection) connection.release(); // 🔥 SEMPRE LIBERAR
    }
};

/**
 * Executa uma transação com múltiplas queries
 */
export const transaction = async <T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        const result = await callback(connection);
        
        await connection.commit();
        return result;
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('❌ Erro na transação:', error);
        throw error;
    } finally {
        if (connection) connection.release(); // 🔥 SEMPRE LIBERAR
    }
};

/**
 * Obtém uma conexão do pool (para uso em transações manuais)
 */
export const getConnection = async (): Promise<mysql.PoolConnection> => {
    return await pool.getConnection();
};

/**
 * Fecha o pool de conexões (usar ao desligar o app)
 */
export const closePool = async (): Promise<void> => {
    try {
        await pool.end();
        console.log('✅ Pool de conexões fechado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao fechar pool:', error);
    }
};

export default pool;
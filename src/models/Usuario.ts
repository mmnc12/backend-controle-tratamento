export interface Usuario {
    id: number;
    nome: string;
    email: string;
    senha: string;
    perfil: 'admin' | 'usuario' | 'visualizador';
    ativo: boolean;
    data_criacao: Date;
    ultimo_login: Date | null;
}

export interface LoginDTO {
    email: string;
    senha: string;
}

export interface UsuarioResponse {
    id: number;
    nome: string;
    email: string;
    perfil: 'admin' | 'usuario' | 'visualizador';
    ativo: boolean;
    data_criacao: Date;
    ultimo_login: Date | null;
}

export interface LoginResponse {
    token: string;
    usuario: UsuarioResponse;
}
export interface Localidade {
    id: number;
    codigo: string;
    nome: string;
    descricao: string | null;
}

export interface CreateLocalidadeDTO {
    codigo: string;
    nome: string;
    descricao?: string;
}
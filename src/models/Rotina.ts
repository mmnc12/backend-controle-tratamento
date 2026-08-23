export interface Rotina {
    id: number;
    ano: number;
    nome: string;
    numero_amostra: string;
    controle: string | null;
    psf_id: number;
    localidade_id: number;
    quarteirao: string | null;
    numero_imovel: string;
    entrega_resultado: 'S' | 'N';
    entrega_documento: 'S' | 'N';
    entrega_medicamento: 'S' | 'N';
    data_tratamento: Date | null;
    data_revisao: Date | null;
    revisao: 'S' | 'N';
    telefone: string | null;
    observacao: string | null;
}

export interface CreateRotinaDTO {
    ano: number;
    nome: string;
    numero_amostra: string;
    controle?: string;
    psf_id: number;
    localidade_id: number;
    quarteirao?: string;
    numero_imovel: string;
    entrega_resultado?: 'S' | 'N';
    entrega_documento?: 'S' | 'N';
    entrega_medicamento?: 'S' | 'N';
    data_tratamento?: Date;
    revisao?: 'S' | 'N';
    telefone?: string;
    observacao?: string;
}
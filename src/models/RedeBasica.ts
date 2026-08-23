export interface RedeBasica {
    id: number;
    ano: number;
    nome: string;
    psf_id: number;
    localidade_id: number;
    quarteirao: string | null;
    numero_imovel: string | null;
    entrega_documento: 'S' | 'N';
    entrega_medicamento: 'S' | 'N';
    data_tratamento: Date | null;
    data_revisao: Date | null;
    revisao: 'S' | 'N';
    telefone: string | null;
    observacao: string | null;
}

export interface CreateRedeBasicaDTO {
    ano: number;
    nome: string;
    psf_id: number;
    localidade_id: number;
    quarteirao?: string;
    numero_imovel?: string;
    entrega_documento?: 'S' | 'N';
    entrega_medicamento?: 'S' | 'N';
    data_tratamento?: Date;
    revisao?: 'S' | 'N';
    telefone?: string;
    observacao?: string;
}
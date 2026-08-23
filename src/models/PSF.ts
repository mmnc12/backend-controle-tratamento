export interface PSF {
    id: number;
    nome: string;
    nome_enfermeira: string | null;
}

export interface CreatePSFDTO {
    nome: string;
    nome_enfermeira?: string;
}
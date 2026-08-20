export interface Recuerdo {
    id: number;
    titulo: string;
    descripcion: string;
    foto_url: string;
    fecha: string;
}

export interface GrupoRecuerdos {
    fechaCorta: string;
    fechaFormateada: string;
    recuerdos: Recuerdo[];
}
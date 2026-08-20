export interface Coordenada {
    id: string;
    x: number;
    y: number;
    tipo: 'peonia' | 'gato' | 'coca-cola';
    direccionX: 'derecha' | 'izquierda';
}

export interface EstadoJugador {
    x: number;
    y: number;
    estadoAnimacion: 'reposo' | 'corre-derecha' | 'corre-izquierda' | 'derrotada';
    direccionX: 'derecha' | 'izquierda';
}
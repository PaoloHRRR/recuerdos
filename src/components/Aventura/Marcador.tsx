interface Props {
    tiempo: number;
    puntuacion: number;
}

export function Marcador({ tiempo, puntuacion }: Props) {
    return (
        <header className="marcador">
            <div className="tiempo">Tiempo: {tiempo}s</div>
            <div className="puntos">Puntos: {puntuacion}</div>
        </header>
    );
}
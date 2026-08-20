import type {Coordenada, EstadoJugador} from "../../interfaces/aventura.ts";

interface Props {
    elementos: Coordenada[];
    jugador: EstadoJugador;
    tamanoCasilla: number;
}

export function TableroJuego({ elementos, jugador, tamanoCasilla }: Props) {
    return (
        <div className="escenario">
            <div className="tablero">
                {elementos.map(el => (
                    <div
                        key={el.id}
                        className={`${el.tipo} ${el.tipo === 'gato' ? `corre-${el.direccionX}` : ''}`}
                        style={{
                            left: el.x * tamanoCasilla,
                            top: el.y * tamanoCasilla
                        }}
                    />
                ))}

                <div
                    className={`jugador ${jugador.estadoAnimacion}`}
                    style={{
                        left: jugador.x * tamanoCasilla,
                        top: (jugador.y * tamanoCasilla) - 32
                    }}
                />
            </div>
        </div>
    );
}
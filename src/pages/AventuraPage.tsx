import '../styles/Aventura.css';

import { useAventura, TAMANO_CASILLA } from '../hooks/useAventura';
import { Marcador } from '../components/Aventura/Marcador';
import { TableroJuego } from '../components/Aventura/TableroJuego';
import { ModalFinJuego } from '../components/Aventura/ModalFinJuego';

export default function AventuraPage() {
    const {
        tiempo,
        puntuacion,
        jugando,
        jugador,
        elementos,
        recuerdoDesbloqueado,
        reiniciarJuego
    } = useAventura();

    return (
        <div className="contenedor-juego">

            <Marcador
                tiempo={tiempo}
                puntuacion={puntuacion}
            />

            <TableroJuego
                elementos={elementos}
                jugador={jugador}
                tamanoCasilla={TAMANO_CASILLA}
            />

            {!jugando && (
                <ModalFinJuego
                    puntuacion={puntuacion}
                    recuerdoDesbloqueado={recuerdoDesbloqueado}
                    reiniciarJuego={reiniciarJuego}
                />
            )}

        </div>
    );
}

import { useNavigate } from 'react-router-dom';

interface Props {
    puntuacion: number;
    recuerdoDesbloqueado: any;
    reiniciarJuego: () => void;
}

export function ModalFinJuego({ puntuacion, recuerdoDesbloqueado, reiniciarJuego }: Props) {
    const navigate = useNavigate();

    return (
        <div className="pantalla-final">
            <h2>¡DESBLOQUEASTE UN RECUERDO!</h2>
            <p>Lograste {puntuacion} puntos llenos de amor.</p>

            {recuerdoDesbloqueado && (
                <div className="recuerdo-desbloqueado">
                    <img
                        src={recuerdoDesbloqueado.foto_url}
                        alt={recuerdoDesbloqueado.titulo}
                    />
                    <h3>{recuerdoDesbloqueado.titulo}</h3>
                    <p>{recuerdoDesbloqueado.descripcion}</p>
                </div>
            )}

            <div className="botones-finales">
                <button onClick={reiniciarJuego}>Jugar otra vez</button>
                <button onClick={() => navigate('/')}>Regresar a recuerdos</button>
            </div>
        </div>
    );
}
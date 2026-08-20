import type {Recuerdo} from "../interfaces/recuerdos.ts";

export function TarjetaRecuerdo({ recuerdo }: { recuerdo: Recuerdo }) {
    return (
        <article className="tarjeta-polaroid">
            <div className="marco-foto">
                <img src={recuerdo.foto_url} alt={recuerdo.titulo} loading="lazy" />
            </div>
            <div className="contenido-texto">
                <h3>{recuerdo.titulo}</h3>
                <p>{recuerdo.descripcion}</p>
            </div>
        </article>
    );
}
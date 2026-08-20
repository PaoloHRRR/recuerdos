import '../styles/Recuerdos.css';
import {useEffect, useState} from "react";
import {supabase} from "../supabaseClient.ts";

interface Recuerdo {
    id: number;
    titulo: string;
    descripcion: string;
    foto_url: string;
    fecha: string;
}

interface GrupoRecuerdos {
    fechaCorta: string;
    fechaFormateada: string;
    recuerdos: Recuerdo[];
}

export default function Recuerdos() {
    const [grupos, setGrupos] = useState<GrupoRecuerdos[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);

    useEffect(() => {
        obtenerYAgruparRecuerdos();
    }, []);

    const obtenerYAgruparRecuerdos = async () => {
        try {
            const { data, error } = await supabase
                .from('recuerdos')
                .select('*')
                .order('fecha', { ascending: true });

            if (error) throw error;

            if (data) {
                const recuerdosAgrupados = data.reduce((acumulador: Record<string, Recuerdo[]>, recuerdo: Recuerdo) => {
                    const fechaCorta = recuerdo.fecha.split('T')[0];

                    if (!acumulador[fechaCorta]) {
                        acumulador[fechaCorta] = [];
                    }
                    acumulador[fechaCorta].push(recuerdo);
                    return acumulador;
                }, {});

                const arregloGrupos: GrupoRecuerdos[] = Object.keys(recuerdosAgrupados).map(fechaCorta => {
                    const fechaObj = new Date(fechaCorta + "T00:00:00");
                    const opciones: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', opciones);

                    return {
                        fechaCorta,
                        fechaFormateada,
                        recuerdos: recuerdosAgrupados[fechaCorta]
                    };
                });

                setGrupos(arregloGrupos);
            }
        } catch (error) {
            console.error("Error al cargar los recuerdos:", error);
        } finally {
            setCargando(false);
        }
    };

    if (cargando) {
        return <div className="pantalla-carga">Cargando nuestra historia...</div>;
    }

    return (
        <div className="contenedor-principal">
            <header className="cabecera">
                <h1 className="titulo-principal">Nuestra Historia de Amor</h1>
                <p className="subtitulo">Cada día a tu lado es mi recuerdo favorito</p>
            </header>

            <main className="linea-tiempo">
                {grupos.map((grupo) => (
                    <section key={grupo.fechaCorta} className="grupo-fecha">
                        <div className="etiqueta-fecha">
                            <h2>{grupo.fechaFormateada}</h2>
                        </div>

                        <div className="grid-fotos">
                            {grupo.recuerdos.map((recuerdo) => (
                                <article key={recuerdo.id} className="tarjeta-polaroid">
                                    <div className="marco-foto">
                                        <img src={recuerdo.foto_url} alt={recuerdo.titulo} loading="lazy" />
                                    </div>
                                    <div className="contenido-texto">
                                        <h3>{recuerdo.titulo}</h3>
                                        <p>{recuerdo.descripcion}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                ))}
            </main>
        </div>
    );
}
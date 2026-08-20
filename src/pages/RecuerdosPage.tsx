import '../styles/Recuerdos.css';
import { supabase } from "../supabaseClient.ts";
import { CarruselMovil } from '../components/CarruselMovil';
import { TarjetaRecuerdo } from '../components/TarjetaRecuerdo';
import type {GrupoRecuerdos, Recuerdo} from "../interfaces/recuerdos.ts";
import {useEffect, useState} from "react";

export default function RecuerdosPage() {
    const [grupos, setGrupos] = useState<GrupoRecuerdos[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [esMovil, setEsMovil] = useState<boolean>(false);

    useEffect(() => {
        obtenerYAgruparRecuerdos();
        const verificarResolucion = () => setEsMovil(window.innerWidth <= 768);
        verificarResolucion();
        window.addEventListener('resize', verificarResolucion);
        return () => window.removeEventListener('resize', verificarResolucion);
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
            console.error(error);
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
                        {esMovil ? (
                            <CarruselMovil recuerdos={grupo.recuerdos} />
                        ) : (
                            <div className="grid-fotos">
                                {grupo.recuerdos.map((recuerdo) => (
                                    <TarjetaRecuerdo key={recuerdo.id} recuerdo={recuerdo} />
                                ))}
                            </div>
                        )}
                    </section>
                ))}
            </main>
        </div>
    );
}
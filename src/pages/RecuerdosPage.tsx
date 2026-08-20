import '../styles/Recuerdos.css';
import {useEffect, useState} from "react";
import {supabase} from "../supabaseClient.ts";
import React from 'react';

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

function CarruselMovil({ recuerdos }: { recuerdos: Recuerdo[] }) {
    const [indiceActual, setIndiceActual] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    useEffect(() => {
        if (recuerdos.length <= 1) return;
        const intervalo = setInterval(() => {
            setIndiceActual((prev) => (prev + 1) % recuerdos.length);
        }, 8000);
        return () => clearInterval(intervalo);
    }, [recuerdos.length]);

    const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
    const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distancia = touchStart - touchEnd;
        const umbral = 50;
        if (distancia > umbral) {
            setIndiceActual((prev) => (prev + 1) % recuerdos.length);
        }
        if (distancia < -umbral) {
            setIndiceActual((prev) => (prev - 1 + recuerdos.length) % recuerdos.length);
        }
        setTouchStart(0);
        setTouchEnd(0);
    };

    return (
        <div className="carrusel-movil" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <div className="carrusel-interno" style={{ transform: `translateX(-${indiceActual * 100}%)` }}>
                {recuerdos.map((recuerdo) => (
                    <div className="carrusel-item" key={recuerdo.id}>
                        <TarjetaRecuerdo recuerdo={recuerdo} />
                    </div>
                ))}
            </div>
            {recuerdos.length > 1 && (
                <div className="carrusel-indicadores">
                    {recuerdos.map((_, idx) => (
                        <div key={idx} className={`indicador ${idx === indiceActual ? 'activo' : ''}`} />
                    ))}
                </div>
            )}
        </div>
    );
}

function TarjetaRecuerdo({ recuerdo }: { recuerdo: Recuerdo }) {
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
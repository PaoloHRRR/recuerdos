import React, { useState } from 'react';
import { TarjetaRecuerdo } from './TarjetaRecuerdo';
import type {Recuerdo} from "../interfaces/recuerdos.ts";

export function CarruselMovil({ recuerdos }: { recuerdos: Recuerdo[] }) {
    const [indiceActual, setIndiceActual] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

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
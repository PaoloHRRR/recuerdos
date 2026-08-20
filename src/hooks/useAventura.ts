import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient.ts';
import type {Coordenada, EstadoJugador} from "../interfaces/aventura.ts";

export const TAMANO_CASILLA = 64;

export const useAventura = () => {
    const [dimensiones, setDimensiones] = useState({ col: 15, fil: 10 });
    const [tiempo, setTiempo] = useState<number>(30);
    const [puntuacion, setPuntuacion] = useState<number>(0);
    const [jugando, setJugando] = useState<boolean>(true);
    const [recuerdoDesbloqueado, setRecuerdoDesbloqueado] = useState<any>(null);

    const [jugador, setJugador] = useState<EstadoJugador>({
        x: 5, y: 5, estadoAnimacion: 'reposo', direccionX: 'derecha'
    });

    const [elementos, setElementos] = useState<Coordenada[]>([]);
    const teclas = useRef<{ [key: string]: boolean }>({});

    useEffect(() => {
        const actualizarDimensiones = () => {
            setDimensiones({
                col: Math.floor(window.innerWidth / TAMANO_CASILLA),
                fil: Math.floor(window.innerHeight / TAMANO_CASILLA)
            });
        };
        actualizarDimensiones();
        window.addEventListener('resize', actualizarDimensiones);
        return () => window.removeEventListener('resize', actualizarDimensiones);
    }, []);

    const MIN_X = 2;
    const MAX_X = Math.max(2, dimensiones.col - 3);
    const MIN_Y = 2;
    const MAX_Y = Math.max(2, dimensiones.fil - 3);

    useEffect(() => {
        if (!jugando) return;
        const timer = setInterval(() => {
            setTiempo((prev) => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [jugando]);

    useEffect(() => {
        if (tiempo <= 0 && jugando) {
            terminarJuego();
        }
    }, [tiempo, jugando]);

    const terminarJuego = async () => {
        setJugando(false);
        setJugador(j => ({ ...j, estadoAnimacion: 'derrotada' }));
        try {
            const { data, error } = await supabase.from('recuerdos').select('*');
            if (error) throw error;
            if (data && data.length > 0) {
                const indiceAleatorio = Math.floor(Math.random() * data.length);
                setRecuerdoDesbloqueado(data[indiceAleatorio]);
            }
        } catch (error) {
            console.error("Error al traer el recuerdo:", error);
        }
    };

    const reiniciarJuego = () => {
        setTiempo(30);
        setPuntuacion(0);
        setElementos([]);
        setRecuerdoDesbloqueado(null);
        setJugador({ x: 5, y: 5, estadoAnimacion: 'reposo', direccionX: 'derecha' });
        setJugando(true);
    };

    useEffect(() => {
        if (!jugando) return;
        const generador = setInterval(() => {
            setElementos(prev => {
                const numPeonias = prev.filter(e => e.tipo === 'peonia').length;
                const numGatos = prev.filter(e => e.tipo === 'gato').length;
                const numColas = prev.filter(e => e.tipo === 'coca-cola').length;

                const disponibles: string[] = [];
                if (numPeonias < 2) disponibles.push('peonia');
                if (numGatos < 2) disponibles.push('gato');
                if (numColas < 2) disponibles.push('coca-cola');

                if (disponibles.length === 0) return prev;

                const tipo = disponibles[Math.floor(Math.random() * disponibles.length)] as Coordenada['tipo'];
                const x = Math.floor(Math.random() * (MAX_X - MIN_X + 1)) + MIN_X;
                const y = Math.floor(Math.random() * (MAX_Y - MIN_Y + 1)) + MIN_Y;
                const direccionX = Math.random() > 0.5 ? 'derecha' : 'izquierda';

                return [...prev, { id: Math.random().toString(), x, y, tipo, direccionX }];
            });
        }, 2000);
        return () => clearInterval(generador);
    }, [jugando, MAX_X, MAX_Y, MIN_X, MIN_Y]);

    useEffect(() => {
        if (!jugando) return;
        const moverGatos = setInterval(() => {
            setElementos(prev => prev.map(el => {
                if (el.tipo === 'gato') {
                    let { x, direccionX } = el;
                    if (direccionX === 'derecha') {
                        if (x < MAX_X) x += 1;
                        else direccionX = 'izquierda';
                    } else {
                        if (x > MIN_X) x -= 1;
                        else direccionX = 'derecha';
                    }
                    return { ...el, x, direccionX };
                }
                return el;
            }));
        }, 500);
        return () => clearInterval(moverGatos);
    }, [jugando, MAX_X, MIN_X]);

    useEffect(() => {
        const manejarKeyDown = (e: KeyboardEvent) => { teclas.current[e.key.toLowerCase()] = true; };
        const manejarKeyUp = (e: KeyboardEvent) => { teclas.current[e.key.toLowerCase()] = false; };
        window.addEventListener('keydown', manejarKeyDown);
        window.addEventListener('keyup', manejarKeyUp);
        return () => {
            window.removeEventListener('keydown', manejarKeyDown);
            window.removeEventListener('keyup', manejarKeyUp);
        };
    }, []);

    useEffect(() => {
        if (!jugando) return;
        const gameTick = setInterval(() => {
            setJugador(prev => {
                let { x, y, direccionX } = prev;
                let moviendo = false;

                if (teclas.current['arrowup'] || teclas.current['w']) {
                    y = Math.max(MIN_Y, y - 1); moviendo = true;
                } else if (teclas.current['arrowdown'] || teclas.current['s']) {
                    y = Math.min(MAX_Y, y + 1); moviendo = true;
                }

                if (teclas.current['arrowleft'] || teclas.current['a']) {
                    x = Math.max(MIN_X, x - 1); moviendo = true; direccionX = 'izquierda';
                } else if (teclas.current['arrowright'] || teclas.current['d']) {
                    x = Math.min(MAX_X, x + 1); moviendo = true; direccionX = 'derecha';
                }

                if (!moviendo && prev.estadoAnimacion === 'reposo' && prev.x === x && prev.y === y) {
                    return prev;
                }

                return { x, y, direccionX, estadoAnimacion: moviendo ? `corre-${direccionX}` : 'reposo' };
            });
        }, 220);
        return () => clearInterval(gameTick);
    }, [jugando, MIN_X, MAX_X, MIN_Y, MAX_Y]);

    useEffect(() => {
        if (!jugando) return;

        const colisionIndex = elementos.findIndex(el => el.x === jugador.x && el.y === jugador.y);

        if (colisionIndex !== -1) {
            const elemento = elementos[colisionIndex];
            setElementos(prev => prev.filter((_, idx) => idx !== colisionIndex));

            if (elemento.tipo === 'peonia') setPuntuacion(p => p + 2);
            if (elemento.tipo === 'gato') setPuntuacion(p => p + 5);
            if (elemento.tipo === 'coca-cola') setTiempo(t => t + 5);
        }
    }, [jugador.x, jugador.y, elementos, jugando]);

    return {
        tiempo,
        puntuacion,
        jugando,
        jugador,
        elementos,
        recuerdoDesbloqueado,
        reiniciarJuego
    };
};
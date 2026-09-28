import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CisternasService from "../../services/CisternasService";
import TelemetriaService from "../../services/Telemetriaservices";

const cisternasService = new CisternasService();
const telemetriaService = new TelemetriaService();

const INTERVALO_MS = 15000;
const CENTRO_BOLIVIA = [-16.5, -64.5];

// Verde: bien cargada, ámbar: nivel medio, rojo: nivel bajo.
function colorPorNivel(nivel, capacidad) {
  if (!capacidad) return "#4b7bec";
  const pct = nivel / capacidad;
  if (pct < 0.2) return "#d64545";
  if (pct < 0.5) return "#e0a100";
  return "#2f9e6b";
}

/** Línea simple del nivel de carga (historial en orden cronológico). */
function LineaNivel({ puntos }) {
  if (puntos.length < 2) return <p>Aún no hay suficientes registros para graficar.</p>;
  const w = 480;
  const h = 120;
  const valores = puntos.map((p) => p.nivelCarga);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;
  const d = valores
    .map((v, i) => {
      const x = (i / (valores.length - 1)) * w;
      const y = h - ((v - min) / rango) * (h - 10) - 5;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="monitoreo__linea" role="img" aria-label="Historial del nivel de carga">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/**
 * MonitoreoPantalla
 * ------------------------------------------------------------------
 * Mapa con la última posición de cada cisterna (Leaflet + OpenStreetMap)
 * y detalle con el historial de nivel de carga de la seleccionada.
 * El backend no tiene WebSocket, así que se actualiza por polling cada
 * 15 s (se puede pausar). Pide una telemetría por cisterna en cada
 * ciclo: si la flota crece mucho, conviene un endpoint que devuelva
 * todas las últimas posiciones en una sola llamada.
 */
function MonitoreoPantalla() {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const capaRef = useRef(null);

  const [filas, setFilas] = useState([]); // { cisterna, punto }
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [automatico, setAutomatico] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  const [seleccionada, setSeleccionada] = useState(null); // cisterna
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Mapa: se crea una vez y se destruye al salir.
  useEffect(() => {
    const mapa = L.map(contenedorRef.current).setView(CENTRO_BOLIVIA, 5);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; colaboradores de OpenStreetMap",
    }).addTo(mapa);
    capaRef.current = L.layerGroup().addTo(mapa);
    mapaRef.current = mapa;
    return () => {
      mapa.remove();
      mapaRef.current = null;
    };
  }, []);

  const cargar = useCallback(async () => {
    try {
      const cisternas = await cisternasService.listar();
      const resultados = await Promise.allSettled(
        cisternas.map((c) => cisternasService.obtenerUltimaTelemetria(c.placa))
      );
      setFilas(
        cisternas.map((cisterna, i) => ({
          cisterna,
          punto: resultados[i].status === "fulfilled" ? resultados[i].value : null,
        }))
      );
      setUltimaActualizacion(new Date());
      setError(null);
    } catch {
      setError("No se pudo actualizar la flota. Se reintentará en el próximo ciclo.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (!automatico) return undefined;
    const id = setInterval(cargar, INTERVALO_MS);
    return () => clearInterval(id);
  }, [automatico, cargar]);

  // Redibuja los marcadores cuando cambian los datos.
  useEffect(() => {
    const capa = capaRef.current;
    if (!capa) return;
    capa.clearLayers();
    const coordenadas = [];
    filas.forEach(({ cisterna, punto }) => {
      if (!punto || Number.isNaN(punto.latitud) || Number.isNaN(punto.longitud)) return;
      const pos = [punto.latitud, punto.longitud];
      coordenadas.push(pos);
      const marcador = L.circleMarker(pos, {
        radius: seleccionada?.idCisterna === cisterna.idCisterna ? 12 : 8,
        color: "#1f2937",
        weight: 1.5,
        fillColor: colorPorNivel(punto.nivelCarga, cisterna.capacidadTotal),
        fillOpacity: 0.9,
      });
      marcador.bindTooltip(`${cisterna.placa}: ${punto.nivelCarga.toLocaleString("es-BO")} L`);
      marcador.on("click", () => setSeleccionada(cisterna));
      marcador.addTo(capa);
    });
    // Solo encuadra la primera vez, para no mover el mapa en cada ciclo.
    if (coordenadas.length > 0 && !mapaRef.current._encuadrado) {
      mapaRef.current.fitBounds(coordenadas, { padding: [40, 40], maxZoom: 13 });
      mapaRef.current._encuadrado = true;
    }
  }, [filas, seleccionada]);

  // Historial de la cisterna seleccionada.
  useEffect(() => {
    if (!seleccionada) return;
    let activo = true;
    setCargandoHistorial(true);
    telemetriaService
      .obtenerHistorial(seleccionada.idCisterna, 30)
      .then((h) => activo && setHistorial([...h].reverse()))
      .catch(() => activo && setHistorial([]))
      .finally(() => activo && setCargandoHistorial(false));
    return () => {
      activo = false;
    };
  }, [seleccionada]);

  const sinPosicion = filas.filter((f) => !f.punto).length;

  return (
    <div className="monitoreo">
      <div className="monitoreo__header">
        <h1>Monitoreo de flota</h1>
        <label>
          <input
            type="checkbox"
            checked={automatico}
            onChange={(e) => setAutomatico(e.target.checked)}
          />{" "}
          Actualizar cada 15 s
        </label>
        <button type="button" onClick={cargar}>
          Actualizar ahora
        </button>
        {ultimaActualizacion && (
          <span>Última actualización: {ultimaActualizacion.toLocaleTimeString("es-BO")}</span>
        )}
      </div>

      {error && <p className="error">{error}</p>}
      {cargando && <p>Cargando flota…</p>}
      {!cargando && sinPosicion > 0 && (
        <p>
          {sinPosicion} {sinPosicion === 1 ? "cisterna no tiene" : "cisternas no tienen"} telemetría
          registrada y no aparece en el mapa.
        </p>
      )}

      <div ref={contenedorRef} className="monitoreo__mapa" />

      <section className="monitoreo__detalle">
        {!seleccionada ? (
          <p>Selecciona una cisterna en el mapa para ver su historial de carga.</p>
        ) : (
          <>
            <h2>Cisterna {seleccionada.placa}</h2>
            <p>
              {seleccionada.empresaTransporte}. Capacidad{" "}
              {seleccionada.capacidadTotal.toLocaleString("es-BO")} L, estado {seleccionada.estado}.
            </p>
            {cargandoHistorial ? <p>Cargando historial…</p> : <LineaNivel puntos={historial} />}
          </>
        )}
      </section>
    </div>
  );
}

export default MonitoreoPantalla;
import React, { useState } from 'react';

export default function BogotaApp() {
  const [seccionActiva, setSeccionActiva] = useState('mapa');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      
      {/* HEADER PRINCIPAL */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center font-black text-slate-950 text-lg shadow-lg shadow-cyan-500/30">
              AT
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                A TIEMPO <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full font-normal">Bogotá Core</span>
              </h1>
              <p className="text-[11px] text-slate-400">Rescate urbano y movilidad de precisión</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-medium">Red Activa</span>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* NAVEGACIÓN TÁCTICA INTERNA */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs font-medium">
          <button 
            onClick={() => setSeccionActiva('mapa')}
            className={`py-2.5 rounded-lg transition-all ${seccionActiva === 'mapa' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            🗺️ Radar Vial (Waze)
          </button>
          <button 
            onClick={() => setSeccionActiva('rescate')}
            className={`py-2.5 rounded-lg transition-all ${seccionActiva === 'rescate' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            🧭 Guía de Rescate
          </button>
          <button 
            onClick={() => setSeccionActiva('offgrid')}
            className={`py-2.5 rounded-lg transition-all ${seccionActiva === 'offgrid' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            📡 Canal Off-Grid
          </button>
        </div>

        {/* VISTA 1: MAPA DE WAZE */}
        {seccionActiva === 'mapa' && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-200">Tráfico en Vivo - Bogotá</h2>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded">Actualización instantánea</span>
            </div>
            <div className="w-full h-[450px] rounded-xl overflow-hidden border border-slate-800">
              <iframe 
                src="https://embed.waze.com/iframe?zoom=13&lat=4.6097&lon=-74.0817&ct=livemap" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen
              ></iframe>
            </div>
          </section>
        )}

        {/* VISTA 2: GUÍA DE RESCATE (ANTI-PARADEROS PROVISIONALES) */}
        {seccionActiva === 'rescate' && (
          <section className="space-y-4 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h2 className="text-base font-bold text-cyan-400 mb-1">Modo Rescate: Paradero Provisional</h2>
              <p className="text-xs text-slate-400 mb-4">¿Te dejaron fuera de ruta o la parada cambió? Selecciona tu situación para recibir la ruta de enlace peatonal y evitar taxis:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl hover:border-cyan-500/50 transition-all cursor-pointer">
                  <h3 className="text-sm font-bold text-slate-200 mb-1">🚶‍♂️ Enlace a Vía Principal</h3>
                  <p className="text-xs text-slate-400">Calcula los pasos exactos a la carrera o calle más cercana donde el SITP fluye sin trancones.</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl hover:border-cyan-500/50 transition-all cursor-pointer">
                  <h3 className="text-sm font-bold text-slate-200 mb-1">👥 Radar de Fila Comunitario</h3>
                  <p className="text-xs text-slate-400">Ver reportes anónimos recientes de otros pasajeros varados en este mismo corredor.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* VISTA 3: CANAL OFF-GRID (SIN CONEXIÓN) */}
        {seccionActiva === 'offgrid' && (
          <section className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center font-bold">
                📡
              </div>
              <div>
                <h2 className="text-base font-bold text-amber-400">Red de Emergencia Descentralizada</h2>
                <p className="text-xs text-slate-400">Protocolo activo para comunicación sin datos móviles ni internet.</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-3">
              <div className="flex items-center gap-2 text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="font-semibold">Buscando nodos de pasajeros cercanos (Mesh Relay)...</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Si la red celular de Bogotá colapsa en hora pico o por protestas, este módulo emite paquetes de texto cortos cifrados hacia otros dispositivos cercanos de "A Tiempo" para transmitir tu ubicación y estado sin gastar saldo ni requerir operador.
              </p>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

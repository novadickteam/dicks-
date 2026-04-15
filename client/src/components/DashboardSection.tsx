import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell
} from 'recharts';
import { Activity, Droplets, Thermometer, Sun, Wind, Beaker, Sprout, Zap, AlertTriangle } from 'lucide-react';

// Generador de datos simulados
const generateData = () => {
  return Array.from({ length: 20 }).map((_, i) => ({
    time: `${i}:00`,
    temp: 20 + Math.random() * 5,
    hum: 60 + Math.random() * 15,
    ph: 5.5 + Math.random() * 1.5,
    light: 300 + Math.random() * 200,
  }));
};

export function DashboardSection() {
  const [data, setData] = useState(generateData());
  const [activeTab, setActiveTab] = useState('clima');
  const [alerts, setAlerts] = useState<string[]>([]);

  // Actualizar datos periódicamente para simular tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData.slice(1)];
        const last = prevData[prevData.length - 1];
        
        // Simular pequeñas variaciones
        const nextTemp = last.temp + (Math.random() - 0.5) * 1;
        const nextHum = last.hum + (Math.random() - 0.5) * 2;
        
        // Generar alertas aleatorias
        if (nextTemp > 24.5 && !alerts.includes("Alerta Temp Alta")) {
          setAlerts(prev => ["Alerta Temp Alta", ...prev].slice(0, 3));
        }
        
        newData.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          temp: nextTemp,
          hum: nextHum,
          ph: 5.5 + Math.random() * 1.5,
          light: 300 + Math.random() * 200,
        });
        return newData;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [alerts]);

  const currentValues = data[data.length - 1];

  return (
    <section id="dashboard" className="py-32 relative bg-zinc-950 text-white overflow-hidden">
      {/* Background tech grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6"
          >
            <Activity size={14} className="animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase">Monitoreo en Tiempo Real</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white"
          >
            Centro de Control <span className="text-blue-400">IoT</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-400"
          >
            Miles de sensores alimentando algoritmos predictivos. Nuestras plantas hablan; nosotros traducimos sus necesidades en acciones automatizadas.
          </motion.p>
        </div>

        {/* Dashboard UI */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl overflow-hidden shadow-2xl shadow-blue-900/10"
        >
          {/* Dashboard Header */}
          <div className="border-b border-zinc-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/80">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                Módulo Central Biosfera-01
              </h3>
              <p className="text-sm text-zinc-400 mt-1 font-mono">ID: AST-8492-X | Estado: Nominal</p>
            </div>
            
            <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-800">
              <button 
                onClick={() => setActiveTab('clima')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'clima' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Clima
              </button>
              <button 
                onClick={() => setActiveTab('nutrientes')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'nutrientes' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Nutrientes
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <MetricCard 
                icon={<Thermometer className="text-orange-400" />}
                title="Temperatura"
                value={`${currentValues.temp.toFixed(1)}°C`}
                trend="+0.2°C"
                color="orange"
              />
              <MetricCard 
                icon={<Droplets className="text-blue-400" />}
                title="Humedad Rel."
                value={`${currentValues.hum.toFixed(1)}%`}
                trend="-1.5%"
                color="blue"
              />
              <MetricCard 
                icon={<Sun className="text-yellow-400" />}
                title="Luz PAR"
                value={`${Math.round(currentValues.light)} μmol`}
                trend="Estable"
                color="yellow"
              />
              <MetricCard 
                icon={<Beaker className="text-purple-400" />}
                title="pH Solución"
                value={currentValues.ph.toFixed(2)}
                trend="+0.05"
                color="purple"
              />
            </div>

            {/* Main Chart Area */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-semibold text-zinc-200">Análisis Temporal</h4>
                  <span className="text-xs font-mono text-zinc-500 flex items-center gap-2">
                    <Activity size={12} /> Actualizando...
                  </span>
                </div>
                
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="time" stroke="#52525b" tick={{fill: '#71717a', fontSize: 12}} tickMargin={10} minTickGap={30} />
                      <YAxis stroke="#52525b" tick={{fill: '#71717a', fontSize: 12}} width={40} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                        itemStyle={{ color: '#e4e4e7' }}
                        labelStyle={{ color: '#a1a1aa' }}
                      />
                      <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
                      <Area type="monotone" dataKey="hum" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorHum)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Side Panel - Alerts & Actions */}
              <div className="flex flex-col gap-6">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 flex-1">
                  <h4 className="font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                    <Zap size={16} className="text-yellow-400" />
                    Acciones Automatizadas
                  </h4>
                  
                  <div className="space-y-3">
                    <ActionItem label="Bomba de Riego A" status="Activa" time="Ahora" active />
                    <ActionItem label="Ventilación Extractor" status="Reposo" time="Hace 5m" />
                    <ActionItem label="Luces LED Espectro" status="Activa" time="Continuo" active />
                    <ActionItem label="Dosificador Nutrientes" status="Programado" time="En 2h" />
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <h4 className="font-semibold text-zinc-200 mb-3 text-sm flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-400" />
                    Registro de Alertas
                  </h4>
                  <div className="space-y-2 max-h-[100px] overflow-y-auto">
                    <AnimatePresence>
                      {alerts.length > 0 ? (
                        alerts.map((alert, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-xs p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 flex justify-between"
                          >
                            <span>{alert}</span>
                            <span className="opacity-50">Justo ahora</span>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-xs text-zinc-500 p-2 text-center">No hay alertas recientes. Sistema estable.</div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MetricCard({ icon, title, value, trend, color }: any) {
  const bgColors = {
    orange: 'bg-orange-500/10 border-orange-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
    yellow: 'bg-yellow-500/10 border-yellow-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
    green: 'bg-green-500/10 border-green-500/20',
  };

  return (
    <div className={`rounded-2xl border ${bgColors[color as keyof typeof bgColors]} p-4 flex flex-col justify-between h-32 hover:bg-opacity-20 transition-all cursor-default`}>
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-lg bg-zinc-950/50`}>
          {icon}
        </div>
        <span className="text-xs font-mono text-zinc-400">{trend}</span>
      </div>
      <div>
        <p className="text-zinc-400 text-sm">{title}</p>
        <p className="text-2xl font-bold font-mono tracking-tight text-white">{value}</p>
      </div>
    </div>
  );
}

function ActionItem({ label, status, time, active = false }: any) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-zinc-600'}`} />
        <span className="text-sm text-zinc-300">{label}</span>
      </div>
      <div className="text-right">
        <p className={`text-xs ${active ? 'text-green-400' : 'text-zinc-500'}`}>{status}</p>
        <p className="text-[10px] text-zinc-600 font-mono">{time}</p>
      </div>
    </div>
  );
}

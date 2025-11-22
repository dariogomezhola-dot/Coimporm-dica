
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const dataPerformance = [
  { name: 'Pitch A', rate: 45 },
  { name: 'Pitch B', rate: 62 },
  { name: 'Pitch C', rate: 28 },
  { name: 'Pitch D', rate: 55 },
  { name: 'Pitch E', rate: 38 },
];

const dataTime = [
  { name: 'Lun', time: 12 },
  { name: 'Mar', time: 8 },
  { name: 'Mie', time: 5 },
  { name: 'Jue', time: 15 },
  { name: 'Vie', time: 9 },
];

const ReportsModule: React.FC = () => {
  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar bg-dark-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Reportes de Rendimiento</h1>
            <p className="text-slate-400">Análisis de KPIs y métricas de conversión en tiempo real.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* KPI Cards */}
            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                <h3 className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">Tasa de Cierre Total</h3>
                <div className="flex items-end gap-3">
                    <span className="text-4xl font-bold text-white">24.8%</span>
                    <span className="text-accent text-sm font-medium mb-1">+2.4% vs mes anterior</span>
                </div>
            </div>
            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                <h3 className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">Leads Activos</h3>
                <div className="flex items-end gap-3">
                    <span className="text-4xl font-bold text-white">1,240</span>
                    <span className="text-primary text-sm font-medium mb-1">85 nuevos hoy</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1 */}
            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-lg">
                <h3 className="text-white text-lg font-semibold mb-6">Tasa de Cierre por Pitch</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dataPerformance}>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#22c55e' }}
                                cursor={{fill: '#334155', opacity: 0.2}}
                            />
                            <Bar dataKey="rate" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 2 */}
            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-lg">
                <h3 className="text-white text-lg font-semibold mb-6">Tiempo de Respuesta Promedio (min)</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dataTime}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="time" stroke="#22c55e" strokeWidth={3} dot={{fill: '#22c55e', strokeWidth: 2, r: 4, stroke: '#0f172a'}} activeDot={{r: 6}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsModule;

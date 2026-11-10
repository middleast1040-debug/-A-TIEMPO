import React, { useState, useEffect } from 'react';
import { Route } from '../types/transit';
import {
  Calendar,
  Clock,
  Bell,
  BellRing,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export interface ScheduledRouteItem {
  id: string;
  title: string;
  routeId: string;
  originStop: string;
  destinationStop: string;
  departureTime: string; // "06:45"
  daysOfWeek: number[]; // 0 = Dom, 1 = Lun, 2 = Mar, 3 = Mie, 4 = Jue, 5 = Vie, 6 = Sab
  reminderActive: boolean;
  notes?: string;
}

interface WeeklyRouteScheduleProps {
  routes: Route[];
  currentRouteId: string;
  originStop: string;
  destinationStop: string;
  onSelectRoute: (routeId: string, origin: string, destination: string) => void;
}

const DAYS_SHORT = [
  { day: 1, label: 'Lun', full: 'Lunes' },
  { day: 2, label: 'Mar', full: 'Martes' },
  { day: 3, label: 'Mié', full: 'Miércoles' },
  { day: 4, label: 'Jue', full: 'Jueves' },
  { day: 5, label: 'Vie', full: 'Viernes' },
  { day: 6, label: 'Sáb', full: 'Sábado' },
  { day: 0, label: 'Dom', full: 'Domingo' },
];

const INITIAL_SCHEDULES: ScheduledRouteItem[] = [
  {
    id: 'sched-1',
    title: 'Trabajo / Oficina',
    routeId: 'tm-h27',
    originStop: 'Estación Calle 100',
    destinationStop: 'Portal Usme',
    departureTime: '06:45',
    daysOfWeek: [1, 2, 3, 4, 5],
    reminderActive: true,
  },
  {
    id: 'sched-2',
    title: 'Regreso a Casa',
    routeId: 'sitp-z8',
    originStop: 'Portal Usme',
    destinationStop: 'Toberín',
    departureTime: '17:30',
    daysOfWeek: [1, 2, 3, 4, 5],
    reminderActive: true,
  },
  {
    id: 'sched-3',
    title: 'Salida Fin de Semana',
    routeId: 'tm-h27',
    originStop: 'Estación Calle 100',
    destinationStop: 'Portal Usme',
    departureTime: '09:15',
    daysOfWeek: [6],
    reminderActive: false,
  },
];

export const WeeklyRouteSchedule: React.FC<WeeklyRouteScheduleProps> = ({
  routes,
  currentRouteId,
  originStop,
  destinationStop,
  onSelectRoute,
}) => {
  const [schedules, setSchedules] = useState<ScheduledRouteItem[]>(() => {
    try {
      const saved = localStorage.getItem('atiempo_weekly_schedule_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_SCHEDULES;
  });

  const todayDayIndex = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<number>(todayDayIndex);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('07:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [newReminder, setNewReminder] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('atiempo_weekly_schedule_v1', JSON.stringify(schedules));
    } catch {
      // ignore
    }
  }, [schedules]);

  const toggleDaySelection = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleToggleReminder = (id: string) => {
    setSchedules((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.reminderActive;
          setToastMessage(
            nextState
              ? `Recordatorio activado a las ${item.departureTime}`
              : `Recordatorio pausado para ${item.title}`
          );
          setTimeout(() => setToastMessage(null), 3000);
          return { ...item, reminderActive: nextState };
        }
        return item;
      })
    );
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveNewSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime || selectedDays.length === 0) return;

    const currentRoute = routes.find((r) => r.id === currentRouteId) || routes[0];
    const newSchedule: ScheduledRouteItem = {
      id: `sched-${Date.now()}`,
      title: newTitle.trim() || `${currentRoute?.code || 'Ruta'} - ${originStop}`,
      routeId: currentRouteId,
      originStop,
      destinationStop,
      departureTime: newTime,
      daysOfWeek: selectedDays,
      reminderActive: newReminder,
    };

    setSchedules((prev) => [...prev, newSchedule]);
    setIsAddingNew(false);
    setNewTitle('');
    setToastMessage(`¡Ruta programada para ${selectedDays.length} días a las ${newTime}!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const daySchedules = schedules.filter((s) => s.daysOfWeek.includes(selectedDay));

  return (
    <div className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-4 text-left transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1C2A3E] pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-[#0070F3]/15 border border-blue-200 dark:border-[#0070F3]/30 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-[#0060EA] dark:text-[#38BDF8]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Rutas Frecuentes Programadas
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Programa tus días habituales y recibe recordatorios automáticos
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingNew((prev) => !prev)}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#0070F3] hover:to-[#0050D0] text-white transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm shadow-blue-500/20 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAddingNew ? 'Cancelar' : 'Programar'}</span>
        </button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-2.5 rounded-xl bg-[#EFF6FF] dark:bg-[#0070F3]/15 border border-[#BFDBFE] dark:border-[#0070F3]/40 text-xs text-[#0060EA] dark:text-[#38BDF8] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Add New Schedule Form */}
      {isAddingNew && (
        <form onSubmit={handleSaveNewSchedule} className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#090F1A] border border-slate-200 dark:border-[#1E2D44] space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-slate-900 dark:text-white font-bold">
            <span>Nueva Programación Semanal</span>
            <span className="text-[11px] text-[#0060EA] dark:text-[#38BDF8]">
              Ruta: {routes.find((r) => r.id === currentRouteId)?.code || 'TM'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Nombre o etiqueta:</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej. Oficina / Estudio"
                className="w-full bg-white dark:bg-[#0E1726] border border-slate-300 dark:border-[#1E2D44] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0070F3]"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Hora de salida:</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full bg-white dark:bg-[#0E1726] border border-slate-300 dark:border-[#1E2D44] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#0070F3]"
                required
              />
            </div>
          </div>

          {/* Days of week selector */}
          <div>
            <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1.5">Días que aplica:</label>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_SHORT.map((d) => {
                const isSelected = selectedDays.includes(d.day);
                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => toggleDaySelection(d.day)}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white shadow-xs font-bold'
                        : 'bg-white dark:bg-[#0E1726] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1E2D44]'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auto Reminder Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={newReminder}
                onChange={(e) => setNewReminder(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-[#0070F3] focus:ring-0"
              />
              <span>Recordarme 10 min antes</span>
            </label>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              Guardar en Calendario
            </button>
          </div>
        </form>
      )}

      {/* Week Calendar Day Strip */}
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS_SHORT.map((d) => {
          const isSelected = selectedDay === d.day;
          const isToday = todayDayIndex === d.day;
          const countForDay = schedules.filter((s) => s.daysOfWeek.includes(d.day)).length;

          return (
            <button
              key={d.day}
              type="button"
              onClick={() => setSelectedDay(d.day)}
              className={`p-2 rounded-xl text-center transition cursor-pointer relative border ${
                isSelected
                  ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] border-[#0070F3] text-white shadow-md shadow-blue-500/25 font-bold'
                  : 'bg-slate-50 dark:bg-[#090F1A] border-slate-200 dark:border-[#1C2A3E] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="text-[10px] font-medium leading-none">{d.label}</div>
              <div className="text-xs font-black mt-1 leading-none">
                {isToday ? 'Hoy' : countForDay > 0 ? `${countForDay}` : '—'}
              </div>
              {countForDay > 0 && (
                <div
                  className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${
                    isSelected ? 'bg-white' : 'bg-[#0070F3] dark:bg-[#38BDF8]'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Scheduled Items for the Selected Day */}
      <div className="space-y-2 pt-1">
        {daySchedules.length === 0 ? (
          <div className="p-5 text-center rounded-xl bg-slate-50 dark:bg-[#090F1A] border border-dashed border-slate-200 dark:border-[#1C2A3E] text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Sin rutas programadas para los {DAYS_SHORT.find((d) => d.day === selectedDay)?.full.toLowerCase()}s.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Toca &ldquo;Programar&rdquo; para agregar tu viaje habitual de este día.
            </p>
          </div>
        ) : (
          daySchedules.map((item) => {
            const route = routes.find((r) => r.id === item.routeId);

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#090F1A] border border-slate-200 dark:border-[#1C2A3E] hover:border-blue-300 dark:hover:border-[#2A3F5E] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] text-[#0060EA] dark:text-[#38BDF8] shrink-0 font-mono font-bold text-xs flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.departureTime}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {item.title}
                      </span>
                      {route && (
                        <span
                          className="px-1.5 py-0.2 rounded text-[10px] font-bold text-white font-mono shrink-0 shadow-2xs"
                          style={{ backgroundColor: route.accentColor || '#0070F3' }}
                        >
                          {route.code}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      <span className="truncate">{item.originStop}</span>
                      <span>→</span>
                      <span className="truncate">{item.destinationStop}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Reminder Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleReminder(item.id)}
                    className={`p-2 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-medium border ${
                      item.reminderActive
                        ? 'bg-[#EFF6FF] dark:bg-[#0070F3]/20 border-[#BFDBFE] dark:border-[#0070F3]/40 text-[#0060EA] dark:text-[#38BDF8]'
                        : 'bg-white dark:bg-[#0E1726] border-slate-200 dark:border-[#1C2A3E] text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                    title={item.reminderActive ? 'Recordatorio activo (10 min antes)' : 'Activar recordatorio'}
                  >
                    {item.reminderActive ? (
                      <BellRing className="w-3.5 h-3.5" />
                    ) : (
                      <Bell className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden xs:inline">
                      {item.reminderActive ? 'Alarma ON' : 'Alarma OFF'}
                    </span>
                  </button>

                  {/* Load Route in Calculator */}
                  <button
                    type="button"
                    onClick={() => onSelectRoute(item.routeId, item.originStop, item.destinationStop)}
                    className="p-2 rounded-lg bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#0070F3] hover:to-[#0050D0] text-white transition cursor-pointer flex items-center gap-1 text-[11px] font-bold shadow-xs active:scale-95"
                    title="Cargar esta ruta en el calculador ahora"
                  >
                    <span>Cargar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeleteSchedule(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                    title="Eliminar programación"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

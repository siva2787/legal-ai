import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, ShieldAlert, Check } from 'lucide-react';

interface AlertsPageProps {
  onInspectViolation: (id: string) => void;
}

export function AlertsPage({ onInspectViolation }: AlertsPageProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = () => {
    fetch('/api/alerts')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.alerts) {
          setAlerts(data.alerts);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Alerts fetch error:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    fetch(`/api/alerts/${id}/read`, { method: 'PATCH' }).catch(console.warn);
  };

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <div id="alerts-page" className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Inspection Alerts & Notifications
          </h1>
          <p className="text-sm text-slate-500">
            Real-time compliance alerts, statutory follow-ups, and departmental directives.
          </p>
        </div>
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full shrink-0 ${unreadCount > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
            }`}
        >
          {unreadCount} Active Alert{unreadCount === 1 ? '' : 's'}
        </span>
      </div>

      <div className="space-y-3">
        {alerts.filter((a) => !a.is_read).map((alt) => {
          const type = alt.alert_type || alt.type || 'warning';
          const isRead = !!alt.is_read;

          return (
            <div
              key={alt.id}
              className={`p-5 rounded-2xl border bg-white shadow-xs flex items-start justify-between gap-4 transition-all hover:border-slate-300 ${isRead
                  ? 'opacity-70 border-slate-200 bg-slate-50/50'
                  : type === 'critical'
                    ? 'border-rose-200 bg-rose-50/20'
                    : type === 'warning'
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-slate-200'
                }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${type === 'critical'
                      ? 'bg-rose-100 text-rose-700'
                      : type === 'warning'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                >
                  {type === 'critical' ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{alt.title}</h3>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      • {alt.created_at ? new Date(alt.created_at).toLocaleDateString('en-GB') : alt.time || 'Today'}
                    </span>
                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {alt.description || alt.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isRead && (
                  <button
                    onClick={(e) => handleMarkAsRead(alt.id, e)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Dismiss</span>
                  </button>
                )}

                {alt.inspection_id && (
                  <button
                    onClick={() => onInspectViolation(alt.inspection_id)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-500/20 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>View Case</span>
                    <span className="font-black">&gt;</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
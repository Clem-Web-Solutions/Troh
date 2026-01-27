import { Bell, CheckCircle2, FileText, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, cn } from '../ui';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export function ClientNotifications() {
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                // Currently fetching all recent system activities. 
                // Ideally this should be filtered by project or specifically for the user (in backend).
                // Assuming 'getRecentActivities' returns filtered or global safe logs.
                const data = await api.getRecentActivities();
                setActivities(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivities();
        // Optional: Poll every 30s
        const interval = setInterval(fetchActivities, 30000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) return null; // Or skeleton

    // Filter for relevant client notifications (Finance mainly)
    const notifications = activities.filter(a =>
        ['INVOICE_SENT', 'PAYMENT_RECEIVED', 'PHASE_COMPLETED'].includes(a.type)
    );

    if (notifications.length === 0) return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                    <Bell className="w-4 h-4" /> Notifications
                </CardTitle>
            </CardHeader>
            <div className="text-sm text-slate-400">Rien à signaler pour le moment.</div>
        </Card>
    );

    return (
        <Card className="border-none shadow-sm ring-1 ring-slate-200 bg-white">
            <CardHeader className="pb-2 sm:pb-3 border-b border-slate-50 px-4 sm:px-6 py-3 sm:py-4">
                <CardTitle className="text-xs sm:text-sm font-semibold text-slate-600 flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                    <span className="hidden sm:inline">Dernières Actualités</span>
                    <span className="sm:hidden">Actualités</span>
                    <span className="ml-auto bg-red-100 text-red-600 text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full">
                        {notifications.length}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="max-h-[250px] sm:max-h-[300px] overflow-y-auto">
                    {notifications.map((activity) => (
                        <div key={activity.id} className="p-3 sm:p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex gap-2 sm:gap-3 items-start">
                            <div className={cn(
                                "rounded-full p-1.5 sm:p-2 shrink-0 mt-0.5",
                                activity.type === 'INVOICE_SENT' && "bg-amber-50 text-amber-600",
                                activity.type === 'PAYMENT_RECEIVED' && "bg-red-50 text-red-600",
                                activity.type === 'PHASE_COMPLETED' && "bg-blue-50 text-blue-600",
                            )}>
                                {activity.type === 'INVOICE_SENT' && <FileText className="w-3 h-3 sm:w-4 sm:h-4" />}
                                {activity.type === 'PAYMENT_RECEIVED' && <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />}
                                {activity.type === 'PHASE_COMPLETED' && <Info className="w-3 h-3 sm:w-4 sm:h-4" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-tight truncate">
                                    {activity.type === 'INVOICE_SENT' && "Appel de fonds"}
                                    {activity.type === 'PAYMENT_RECEIVED' && "Paiement confirmé"}
                                    {activity.type === 'PHASE_COMPLETED' && "Avancement"}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    {activity.description}
                                </p>
                                <span className="text-[10px] text-slate-400 mt-1.5 block">
                                    {new Date(activity.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

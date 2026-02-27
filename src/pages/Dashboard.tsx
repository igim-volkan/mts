import { useEffect, useState } from 'react';
import { useLeads } from '../context/LeadContext';
import { supabase } from '../lib/supabase';
import type { Task } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Users, TrendingUp, Briefcase, PhoneCall, Calendar, CheckCircle2, FileSignature } from 'lucide-react';


export function Dashboard() {
    const { leads } = useLeads();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [contractsCount, setContractsCount] = useState<number>(0);

    useEffect(() => {
        fetchTasks();
        fetchContractsCount();
    }, []);

    const fetchContractsCount = async () => {
        try {
            const { count, error } = await supabase
                .from('contracts')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;
            setContractsCount(count || 0);
        } catch (error) {
            console.error('Sözleşme sayısı alınamadı:', error);
        }
    };

    const fetchTasks = async () => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('isCompleted', false)
                .order('dueDate', { ascending: true })
                .limit(6);

            if (error) throw error;
            setTasks(data as Task[]);
        } catch (error) {
            console.error('Görevler yüklenemedi:', error);
        }
    };

    const toggleTask = async (taskId: string) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .update({ isCompleted: true })
                .eq('id', taskId);

            if (error) throw error;
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (err: any) {
            alert('Görev güncellenemedi: ' + (err.message || err));
        }
    };

    const totalLeads = leads.length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const wonLeads = leads.filter(l => l.status === 'won').length;

    const sectorsCount = leads.reduce((acc, lead) => {
        lead.sectors.forEach(s => {
            acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    const sortedSectors = Object.entries(sectorsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const leadsToBeEmailed = leads
        .filter(l => l.status === 'emailed')
        .sort((a, b) => new Date(b.lastContactDate).getTime() - new Date(a.lastContactDate).getTime())
        .slice(0, 5);

    const lostLeads = leads.filter(l => l.status === 'lost');
    const lossReasonsCount = lostLeads.reduce((acc, lead) => {
        const reason = lead.lossReason || 'Belirtilmedi';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedLossReasons = Object.entries(lossReasonsCount)
        .sort((a, b) => b[1] - a[1]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-display font-bold">Hoş Geldiniz</h1>
                <p className="text-slate-500 mt-1">Müşteri ve potansiyel müşteri istatistiklerinizi buradan takip edebilirsiniz.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { title: "Toplam Müşteri", value: totalLeads, icon: Users, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
                    { title: "Yeni Müşteri", value: newLeads, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
                    { title: "Kazanılan", value: wonLeads, icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
                    { title: "Sözleşmeler", value: contractsCount, icon: FileSignature, color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-500/20" },
                    { title: "Toplam Sektör", value: Object.keys(sectorsCount).length, icon: PhoneCall, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20" },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                            <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Öncelikli Görevler */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Öncelikli Görevler & Hatırlatıcılar</h3>
                {tasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tasks.map(task => {
                            const relatedLead = leads.find(l => l.id === task.leadId);
                            return (
                                <div key={task.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-3 w-full">
                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        className="mt-0.5 text-slate-300 hover:text-emerald-500 transition-colors tooltip"
                                        title="Tamamlandı olarak işaretle"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{task.title}</p>
                                        {relatedLead && (
                                            <p className="text-xs text-slate-500 mt-1 truncate">🎯 {relatedLead.companyName || `${relatedLead.firstName} ${relatedLead.lastName}`}</p>
                                        )}
                                        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded w-max border border-amber-200/50">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(task.dueDate), 'd MMM, HH:mm', { locale: tr })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm mt-2 pb-2">Bekleyen veya yaklaşan bir göreviniz bulunmuyor. Harika! 🎉</p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Sektörel Dağılım</h3>
                    {sortedSectors.length > 0 ? (
                        <div className="space-y-4">
                            {sortedSectors.map(([sector, count]) => (
                                <div key={sector}>
                                    <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-300">
                                        <span>{sector}</span>
                                        <span className="font-semibold">{count}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(count / totalLeads) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm mt-4">Henüz sektörel veri bulunmuyor.</p>
                    )}
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">E-posta Gönderilecekler</h3>
                    {leadsToBeEmailed.length > 0 ? (
                        <div className="space-y-4">
                            {leadsToBeEmailed.map(lead => (
                                <div key={lead.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-sm">
                                            {lead.firstName[0]}{lead.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-base text-slate-900">{lead.companyName || `${lead.firstName} ${lead.lastName}`}</p>
                                            <p className="text-sm text-slate-500">{lead.companyName ? `${lead.firstName} ${lead.lastName}` : lead.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center">
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-md text-[10px] font-semibold">
                                            Bekliyor
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm mt-4">E-posta gönderimi bekleyen kayıt yok.</p>
                    )}
                </div>

                {/* Kayıp Nedenleri Analizi */}
                <div className="glass-card p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Kayıp Nedenleri Analizi</h3>
                    {sortedLossReasons.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {sortedLossReasons.map(([reason, count]) => (
                                <div key={reason}>
                                    <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-300">
                                        <span className="font-medium">{reason}</span>
                                        <span className="font-semibold text-slate-900">{count} <span className="text-slate-400 font-normal">/ {lostLeads.length}</span></span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div className="bg-red-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${(count / lostLeads.length) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm mt-4">Henüz kaybedilen müşteri kaydı veya neden analizi bulunmuyor.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

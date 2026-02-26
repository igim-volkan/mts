import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLeads } from '../context/LeadContext';
import { supabase } from '../lib/supabase';
import type { LeadActivity, Task } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ArrowLeft, Mail, Phone, Building, Calendar, Edit2, Activity, User, Briefcase, FileText } from 'lucide-react';

export function LeadProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { leads } = useLeads();
    const [activities, setActivities] = useState<LeadActivity[]>([]);
    const [isLoadingActivities, setIsLoadingActivities] = useState(true);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');

    const lead = leads.find(l => l.id === id);

    useEffect(() => {
        if (!id) return;
        fetchActivities();
        fetchTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchActivities = async () => {
        try {
            setIsLoadingActivities(true);
            const { data, error } = await supabase
                .from('lead_activities')
                .select('*')
                .eq('leadId', id)
                .order('createdAt', { ascending: false });

            if (error) throw error;
            setActivities(data as LeadActivity[]);
        } catch (error) {
            console.error('Aktiviteler yüklenemedi:', error);
        } finally {
            setIsLoadingActivities(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('leadId', id)
                .order('dueDate', { ascending: true });

            if (error) throw error;
            setTasks(data as Task[]);
        } catch (error) {
            console.error('Görevler yüklenemedi:', error);
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle || !newTaskDate || !id) return;

        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert([{
                    leadId: id,
                    title: newTaskTitle,
                    dueDate: new Date(newTaskDate).toISOString(),
                }])
                .select()
                .single();

            if (error) throw error;
            setTasks(prev => [...prev, data as Task].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
            setNewTaskTitle('');
            setNewTaskDate('');
        } catch (error: any) {
            alert('Görev eklenemedi: ' + (error.message || error));
        }
    };

    const toggleTask = async (taskId: string, isCompleted: boolean) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .update({ isCompleted })
                .eq('id', taskId);

            if (error) throw error;
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted } : t));
        } catch (error: any) {
            alert('Görev güncellenemedi: ' + (error.message || error));
        }
    };

    if (!lead) return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <p className="text-slate-500">Müşteri bulunamadı.</p>
            <button onClick={() => navigate('/leads')} className="text-blue-600 font-medium hover:underline">Listeye Dön</button>
        </div>
    );

    const statusMap: Record<string, { label: string, color: string }> = {
        new: { label: 'Yeni', color: 'bg-purple-100 text-purple-700 border-purple-200' },
        contacted: { label: 'İletişimde', color: 'bg-blue-100 text-blue-700 border-blue-200' },
        emailed: { label: 'E-posta Gönd.', color: 'bg-amber-100 text-amber-700 border-amber-200' },
        pending: { label: 'Beklemede', color: 'bg-slate-200 text-slate-700 border-slate-300' },
        sent: { label: 'E-posta Gitti', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
        won: { label: 'Kazanıldı', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        lost: { label: 'Kaybedildi', color: 'bg-red-100 text-red-700 border-red-200' }
    };

    const statusInfo = statusMap[lead.status] || { label: lead.status, color: 'bg-slate-100 text-slate-700 border-slate-200' };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'created': return <User className="w-4 h-4 text-emerald-500" />;
            case 'status_change': return <Activity className="w-4 h-4 text-blue-500" />;
            case 'note_added': return <FileText className="w-4 h-4 text-amber-500" />;
            case 'email_sent': return <Mail className="w-4 h-4 text-indigo-500" />;
            case 'call_made': return <Phone className="w-4 h-4 text-purple-500" />;
            default: return <Activity className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate('/leads')}
                        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Müşterilere Dön
                    </button>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-display font-bold text-slate-900">{lead.companyName || `${lead.firstName} ${lead.lastName}`}</h1>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusInfo.color}`}>
                            {statusInfo.label}
                        </span>
                    </div>
                </div>
                <Link
                    to={`/leads/${lead.id}/edit`}
                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 px-4 py-2 rounded-xl font-medium transition-all shadow-sm"
                >
                    <Edit2 className="w-4 h-4" /> Düzenle
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Sol Taraf: Profil Detayları */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                        <h3 className="font-semibold text-lg border-b border-slate-100 pb-2">İletişim Bilgileri</h3>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Yetkili Kişi</p>
                                    <p className="text-sm font-medium text-slate-900">{lead.firstName} {lead.lastName}</p>
                                </div>
                            </div>

                            {lead.companyName && (
                                <div className="flex items-start gap-3">
                                    <Building className="w-5 h-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Firma</p>
                                        <p className="text-sm font-medium text-slate-900">{lead.companyName}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">E-posta</p>
                                    <a href={`mailto:${lead.email}`} className="text-sm font-medium text-blue-600 hover:underline">{lead.email}</a>
                                </div>
                            </div>

                            {lead.phone && (
                                <div className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Telefon</p>
                                        <a href={`tel:${lead.phone}`} className="text-sm font-medium text-blue-600 hover:underline">{lead.phone}</a>
                                    </div>
                                </div>
                            )}
                        </div>

                        <h3 className="font-semibold text-lg border-b border-slate-100 pb-2 pt-2">Sektörler</h3>
                        <div className="flex flex-wrap gap-2">
                            {lead.sectors.map(sector => (
                                <span key={sector} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
                                    {sector}
                                </span>
                            ))}
                            {lead.sectors.length === 0 && <span className="text-sm text-slate-500">Sektör belirtilmemiş.</span>}
                        </div>
                    </div>

                    <div className="glass-card bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-lg border-b border-slate-100 pb-2 mb-4">Hatırlatıcılar & Görevler</h3>

                        <form onSubmit={handleAddTask} className="space-y-3 mb-6">
                            <input
                                type="text"
                                placeholder="Görev açıklaması..."
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <div className="flex gap-2">
                                <input
                                    type="datetime-local"
                                    value={newTaskDate}
                                    onChange={e => setNewTaskDate(e.target.value)}
                                    className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
                                    Ekle
                                </button>
                            </div>
                        </form>

                        <div className="space-y-3">
                            {tasks.map(task => (
                                <div key={task.id} className={`flex items-start gap-3 p-3 border rounded-xl transition-all ${task.isCompleted ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm'}`}>
                                    <input
                                        type="checkbox"
                                        checked={task.isCompleted}
                                        onChange={(e) => toggleTask(task.id, e.target.checked)}
                                        className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                    />
                                    <div>
                                        <p className={`text-sm font-medium ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>{task.title}</p>
                                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(task.dueDate), 'd MMM, HH:mm', { locale: tr })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {tasks.length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-4">Henüz görev eklenmemiş.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sağ Taraf: Zaman Çizelgesi (Timeline) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <h3 className="font-semibold text-xl text-slate-800 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" />
                                Zaman Çizelgesi
                            </h3>
                        </div>

                        {isLoadingActivities ? (
                            <div className="flex justify-center py-10">
                                <span className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">
                                Kaydedilmiş bir aktivite bulunmuyor.
                            </div>
                        ) : (
                            <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-4">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="relative pl-6">
                                        <div className="absolute -left-[13px] top-1 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div className="glass-card bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                                            <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(activity.createdAt), 'd MMMM yyyy, HH:mm', { locale: tr })}
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                                {activity.details}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {lead.notes && (
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-amber-500" /> İlk Notlar / Açıklama
                                </h4>
                                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {lead.notes}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

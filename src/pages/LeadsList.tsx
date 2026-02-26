import { useState } from 'react';
import { useLeads } from '../context/LeadContext';
import { Search, Filter, Mail, Building, Trash2, Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { LeadStatus } from '../types';

export function LeadsList() {
    const { leads, deleteLead, updateLead } = useLeads();
    const [searchTerm, setSearchTerm] = useState('');
    const [emailDateModal, setEmailDateModal] = useState<{ isOpen: boolean, leadId: string | null }>({ isOpen: false, leadId: null });
    const [selectedDate, setSelectedDate] = useState('');

    const filteredLeads = leads.filter(lead => {
        const searchString = `${lead.firstName} ${lead.lastName} ${lead.companyName || ''} ${lead.email}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
    });

    const handleStatusChange = async (leadId: string, newStatus: string) => {
        if (newStatus === 'sent') {
            setEmailDateModal({ isOpen: true, leadId });
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            setSelectedDate(now.toISOString().slice(0, 16));
        } else {
            // Optimistically update, Supabase will be called by context
            await updateLead(leadId, { status: newStatus as LeadStatus });
        }
    };

    const submitEmailDate = async () => {
        if (emailDateModal.leadId && selectedDate) {
            await updateLead(emailDateModal.leadId, {
                status: 'sent',
                emailSentDate: new Date(selectedDate).toISOString()
            });
            setEmailDateModal({ isOpen: false, leadId: null });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold">Müşteri Listesi</h1>
                    <p className="text-slate-500 mt-1">Toplam {leads.length} kayıt bulunuyor.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="İsim, e-posta veya firma ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        />
                    </div>
                    <button className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors tooltip" aria-label="Filtrele">
                        <Filter className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Müşteri</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Firma & Sektör</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredLeads.length > 0 ? (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {lead.firstName[0]}{lead.lastName[0]}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{lead.firstName} {lead.lastName}</div>
                                                    <div className="flex items-center text-xs text-slate-500 mt-0.5 gap-2">
                                                        <span className="flex items-center"><Mail className="w-3 h-3 mr-1" /> {lead.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                                                <Building className="w-3.5 h-3.5 text-slate-400" />
                                                {lead.companyName || '-'}
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {lead.sectors.slice(0, 2).map(sector => (
                                                    <span key={sector} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200">
                                                        {sector}
                                                    </span>
                                                ))}
                                                {lead.sectors.length > 2 && (
                                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200">
                                                        +{lead.sectors.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="relative inline-block group/select">
                                                <select
                                                    value={lead.status}
                                                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                    className={`px-2.5 py-1.5 pr-7 rounded-lg text-xs font-semibold appearance-none border border-transparent outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/30 hover:border-slate-300 transition-all ${lead.status === 'new' ? 'bg-purple-100 text-purple-700' :
                                                        lead.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                                                            lead.status === 'emailed' ? 'bg-amber-100 text-amber-700' :
                                                                lead.status === 'pending' ? 'bg-slate-200 text-slate-700' :
                                                                    lead.status === 'sent' ? 'bg-indigo-100 text-indigo-700' :
                                                                        lead.status === 'won' ? 'bg-emerald-100 text-emerald-700' :
                                                                            'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    <option value="new">Yeni</option>
                                                    <option value="contacted">İletişimde</option>
                                                    <option value="emailed">E-posta Gönderilecek</option>
                                                    <option value="pending">Beklemede</option>
                                                    <option value="sent">E-posta Gönderildi</option>
                                                    <option value="won">Kazanıldı</option>
                                                    <option value="lost">Kaybedildi</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none transition-transform group-hover/select:translate-y-px">
                                                    <svg className={`w-3 h-3 ${lead.status === 'new' ? 'text-purple-700' :
                                                        lead.status === 'contacted' ? 'text-blue-700' :
                                                            lead.status === 'emailed' ? 'text-amber-700' :
                                                                lead.status === 'pending' ? 'text-slate-700' :
                                                                    lead.status === 'sent' ? 'text-indigo-700' :
                                                                        lead.status === 'won' ? 'text-emerald-700' :
                                                                            'text-red-700'
                                                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                            {lead.status === 'sent' && lead.emailSentDate && (
                                                <div className="text-[10.5px] text-slate-500 mt-1.5 flex items-center gap-1 font-medium bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 w-max">
                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                    {format(new Date(lead.emailSentDate), 'd MMM yyyy, HH:mm', { locale: tr })}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => deleteLead(lead.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors tooltip">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Böyle bir müşteri bulunamadı veya henüz müşteri eklemediniz.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Email Date Modal */}
            {emailDateModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="glass-card w-full max-w-sm p-6 space-y-4 relative bg-white shadow-2xl">
                        <button
                            onClick={() => setEmailDateModal({ isOpen: false, leadId: null })}
                            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">E-posta Gönderildi</h3>
                            <p className="text-sm text-slate-500 mt-1">E-postanın gönderildiği tarih ve saati işaretleyin.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Tarih ve Saat</label>
                            <input
                                type="datetime-local"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium text-slate-700"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                            <button
                                onClick={() => setEmailDateModal({ isOpen: false, leadId: null })}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={submitEmailDate}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm shadow-blue-600/20"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

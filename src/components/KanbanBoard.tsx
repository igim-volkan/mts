import { useState } from 'react';
import type { Lead, LeadStatus } from '../types';
import { Link } from 'react-router-dom';
import { Calendar, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface KanbanBoardProps {
    leads: Lead[];
    onStatusChange: (leadId: string, newStatus: string) => void;
}

const COLUMNS: { id: LeadStatus; title: string; color: string }[] = [
    { id: 'new', title: 'Yeni', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { id: 'contacted', title: 'İletişimde', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'emailed', title: 'Mail Gön.', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { id: 'pending', title: 'Beklemede', color: 'bg-slate-200 text-slate-700 border-slate-300' },
    { id: 'sent', title: 'Mail Gitti', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { id: 'won', title: 'Kazanıldı', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { id: 'lost', title: 'Kaybedildi', color: 'bg-red-100 text-red-700 border-red-200' }
];

export function KanbanBoard({ leads, onStatusChange }: KanbanBoardProps) {
    const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedLeadId(id);
        e.dataTransfer.effectAllowed = 'move';
        // Add minimal styling to make it look dragging
        setTimeout(() => {
            if (e.target instanceof HTMLElement) {
                e.target.style.opacity = '0.5';
            }
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedLeadId(null);
        if (e.target instanceof HTMLElement) {
            e.target.style.opacity = '1';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: LeadStatus) => {
        e.preventDefault();
        if (draggedLeadId) {
            onStatusChange(draggedLeadId, status);
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-220px)] items-start">
            {COLUMNS.map(col => {
                const columnLeads = leads.filter(l => l.status === col.id);
                return (
                    <div
                        key={col.id}
                        className="flex-shrink-0 w-72 flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.id)}
                    >
                        {/* Column Header */}
                        <div className={`px-4 py-3 border-b border-slate-200 bg-white/50 backdrop-blur-sm flex items-center justify-between`}>
                            <h3 className="font-semibold text-sm text-slate-800">{col.title}</h3>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${col.color}`}>
                                {columnLeads.length}
                            </span>
                        </div>

                        {/* Column Content */}
                        <div className="flex-1 p-3 overflow-y-auto space-y-3">
                            {columnLeads.map(lead => (
                                <div
                                    key={lead.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, lead.id)}
                                    onDragEnd={handleDragEnd}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-md transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <Link to={`/leads/${lead.id}`} className="font-semibold text-sm text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                                            {lead.companyName || `${lead.firstName} ${lead.lastName}`}
                                        </Link>
                                        <GripVertical className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="text-xs text-slate-500 mb-3">{lead.companyName ? `${lead.firstName} ${lead.lastName}` : lead.email}</div>

                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {lead.sectors.slice(0, 2).map((sector) => (
                                            <span key={sector} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium border border-slate-200">
                                                {sector}
                                            </span>
                                        ))}
                                    </div>

                                    {col.id === 'sent' && lead.emailSentDate && (
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 px-1.5 py-1 rounded border border-slate-100 w-max">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            {format(new Date(lead.emailSentDate), 'd MMM yyyy, HH:mm', { locale: tr })}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {columnLeads.length === 0 && (
                                <div className="h-20 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
                                    Sürükleyip bırak
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

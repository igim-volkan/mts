import { useState, useEffect } from 'react';
import { Copy, Check, Plus, Edit2, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { EmailTemplate } from '../types';

export function EmailTemplates() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [formData, setFormData] = useState({ title: '', subject: '', content: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('email_templates')
                .select('*')
                .order('createdAt', { ascending: false });

            if (error) throw error;
            setTemplates(data || []);
        } catch (error) {
            console.error('Şablonlar yüklenemedi:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (id: string, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Kopyalama işlemi başarısız oldu:', err);
            alert('Metin kopyalanamadı, lütfen manuel kopyalayın.');
        }
    };

    const handleOpenModal = (template?: EmailTemplate) => {
        if (template) {
            setEditingTemplate(template);
            setFormData({ title: template.title, subject: template.subject, content: template.content });
        } else {
            setEditingTemplate(null);
            setFormData({ title: '', subject: '', content: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTemplate(null);
        setFormData({ title: '', subject: '', content: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingTemplate) {
                // Update
                const { error } = await supabase
                    .from('email_templates')
                    .update(formData)
                    .eq('id', editingTemplate.id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('email_templates')
                    .insert([formData]);
                if (error) throw error;
            }
            await fetchTemplates();
            handleCloseModal();
        } catch (error: any) {
            alert('Şablon kaydedilirken bir hata oluştu: ' + (error.message || error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu şablonu silmek istediğinize emin misiniz?')) return;
        try {
            const { error } = await supabase
                .from('email_templates')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchTemplates();
        } catch (error: any) {
            alert('Şablon silinirken bir hata oluştu: ' + (error.message || error));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold">E-posta Metinleri</h1>
                    <p className="text-slate-500 mt-1">Hazır şablonları kullanarak iletişiminizi hızlandırın.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-blue-600/20"
                >
                    <Plus className="w-5 h-5" /> Şablon Ekle
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <span className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></span>
                </div>
            ) : templates.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm glass-card">
                    <p className="text-slate-500">Henüz hiçbir şablon eklenmemiş.</p>
                    <button onClick={() => handleOpenModal()} className="mt-4 text-blue-600 font-medium hover:underline">İlk şablonu oluştur</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {templates.map(template => (
                        <div key={template.id} className="glass-card flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 group">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-start gap-4 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight truncate">
                                        {template.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 truncate">Konu: {template.subject}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => copyToClipboard(template.id, template.content)}
                                        className={`flex items-center justify-center p-2 rounded-xl transition-all ${copiedId === template.id
                                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'
                                            }`}
                                        title={copiedId === template.id ? 'Kopyalandı!' : 'Metni Kopyala'}
                                    >
                                        {copiedId === template.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(template)}
                                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm"
                                        title="Düzenle"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm"
                                        title="Sil"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 flex-1 bg-white dark:bg-slate-800">
                                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                    {template.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Template Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingTemplate ? 'Şablonu Düzenle' : 'Yeni Şablon Ekle'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            <form id="templateForm" onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Şablon Adı / Başlık</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Örn: İlk Tanışma Maili"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">E-posta Konusu (Subject)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Örn: Projeniz Hakkında"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">İçerik</label>
                                    <textarea
                                        required
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        rows={8}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
                                        placeholder="Mail içeriğini buraya girin..."
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                form="templateForm"
                                disabled={isSubmitting}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

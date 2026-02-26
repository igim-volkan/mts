import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../context/LeadContext';
import type { ContactDirection, LeadStatus } from '../types';
import { SECTORS } from '../types';
import { Save, ArrowLeft } from 'lucide-react';

export function NewLead() {
    const navigate = useNavigate();
    const { addLead } = useLeads();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
        sectors: [] as string[],
        lastContactDate: new Date().toISOString().slice(0, 16), // YYYY-MM-DDThh:mm
        contactDirection: 'outbound' as ContactDirection,
        notes: '',
        status: 'new' as LeadStatus,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSectorChange = (sector: string) => {
        setFormData((prev) => {
            if (prev.sectors.includes(sector)) {
                return { ...prev, sectors: prev.sectors.filter((s) => s !== sector) };
            }
            return { ...prev, sectors: [...prev.sectors, sector] };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await addLead({
                ...formData,
                lastContactDate: new Date(formData.lastContactDate).toISOString(),
            });
            navigate('/leads');
        } catch (error) {
            console.error("Failed to add lead:", error);
            // Optionally, we could set an error state here to show to the user
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Geri Dön
                    </button>
                    <h1 className="text-3xl font-display font-bold">Yeni Müşteri Ekle</h1>
                    <p className="text-slate-500 mt-1">Sisteme yeni bir müşteri / lead kaydı oluşturun.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-8">
                {/* Müşteri ve Firma Bilgileri */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-slate-200 dark:border-slate-700 pb-2">Müşteri ve Firma Bilgileri</h3>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Firma / Marka Adı</label>
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Örn. ABC Teknoloji A.Ş."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Ad</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Örn. Ali"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Soyad</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Örn. Yılmaz"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">E-posta <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="ali@ornek.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Telefon Numarası</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="+90 5XX XXX XX XX"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <label className="text-sm font-medium">Sektörler (Çoklu Seçim)</label>
                        <div className="flex flex-wrap gap-2">
                            {SECTORS.map((sector) => (
                                <button
                                    key={sector}
                                    type="button"
                                    onClick={() => handleSectorChange(sector)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${formData.sectors.includes(sector)
                                        ? 'bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-300'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {sector}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* İletişim Detayları */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-slate-200 dark:border-slate-700 pb-2">İletişim Detayları</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Son Temas Zamanı</label>
                            <input
                                type="datetime-local"
                                name="lastContactDate"
                                value={formData.lastContactDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">İletişim Yönü</label>
                            <select
                                name="contactDirection"
                                value={formData.contactDirection}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="inbound">Onlar Bize Ulaştı</option>
                                <option value="outbound">Biz Onlara Ulaştık</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Durum (Status)</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                            <option value="new">Yeni</option>
                            <option value="contacted">Görüşme Ayarlandı / İletişimde</option>
                            <option value="won">Kazanıldı (Satış / Anlaşma)</option>
                            <option value="lost">Kaybedildi / İlgilenmiyor</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Ek Bilgiler (Notlar)</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            placeholder="Örn: Web siteleri oldukça eski, yenilenmesi gerekiyor. Pazartesi günü tekrar aranacak..."
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Müşteriyi Kaydet
                    </button>
                </div>
            </form>
        </div>
    );
}

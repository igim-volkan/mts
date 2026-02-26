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

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Müşteri ve Firma Bilgileri */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                    <div className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Müşteri ve Firma Bilgileri</h3>
                        <p className="text-sm text-slate-500 mt-1">Sisteme eklenecek hedefin temel tanımlayıcı bilgileri.</p>
                    </div>

                    <div className="space-y-1.5 focus-within:text-blue-600 dark:focus-within:text-blue-400 transition-colors">
                        <label className="text-sm font-medium">Firma / Marka Adı</label>
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 focus-within:text-blue-600 dark:focus-within:text-blue-400 transition-colors">
                            <label className="text-sm font-medium">Ad</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1.5 focus-within:text-blue-600 dark:focus-within:text-blue-400 transition-colors">
                            <label className="text-sm font-medium">Soyad</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1.5 focus-within:text-blue-600 dark:focus-within:text-blue-400 transition-colors">
                            <label className="text-sm font-medium">E-posta <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1.5 focus-within:text-blue-600 dark:focus-within:text-blue-400 transition-colors">
                            <label className="text-sm font-medium">Telefon Numarası</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Sektörler (Çoklu Seçim)</label>
                        <div className="flex flex-wrap gap-2">
                            {SECTORS.map((sector) => (
                                <button
                                    key={sector}
                                    type="button"
                                    onClick={() => handleSectorChange(sector)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${formData.sectors.includes(sector)
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-300 shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {sector}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* İletişim Detayları */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                    <div className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Durum & Notlar</h3>
                        <p className="text-sm text-slate-500 mt-1">Müşterinin sistemdeki aşaması ve görüşme özetleri.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 focus-within:text-blue-600 dark:focus-within:text-blue-400 transition-colors flex flex-col justify-end">
                            <label className="text-sm font-medium">İletişim Yönü</label>
                            <select
                                name="contactDirection"
                                value={formData.contactDirection}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white appearance-none"
                            >
                                <option value="inbound">Onlar Bize Ulaştı</option>
                                <option value="outbound">Biz Onlara Ulaştık</option>
                            </select>
                        </div>
                        <div className="space-y-1.5 focus-within:text-blue-600 dark:focus-within:text-blue-400 transition-colors">
                            <label className="text-sm font-medium">Durum (Status)</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white appearance-none"
                            >
                                <option value="new">Yeni</option>
                                <option value="contacted">Görüşme Ayarlandı / İletişimde</option>
                                <option value="emailed">E-posta Gönderilecek</option>
                                <option value="won">Kazanıldı (Satış / Anlaşma)</option>
                                <option value="lost">Kaybedildi / İlgilenmiyor</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5 focus-within:text-blue-600 dark:focus-within:text-blue-400 transition-colors">
                        <label className="text-sm font-medium">Ek Bilgiler (Notlar)</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={5}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="pt-2 flex justify-end">
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

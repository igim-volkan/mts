import { useState, useEffect } from 'react';
import { FileSignature, Plus, Search, Edit2, Trash2, X, Users, Calendar, DollarSign, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Contract } from '../types';

const ASSIGNEES = ['Çiğdem', 'Volkan', 'Elif'];

export function Contracts() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        customerName: '',
        customerLogo: '',
        hasFrontend: false,
        hasBackend: false,
        hasSocialMedia: false,
        hasPrintMedia: false,
        contractDate: '',
        monthlyPayment: 0,
        assignees: [] as string[]
    });

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('contracts')
                .select('*')
                .order('createdAt', { ascending: false });

            if (error) {
                // If the table doesn't exist yet, it might error. Realistically we should handle it better,
                // but for now let's just log and set empty.
                console.error(error);
                setContracts([]);
            } else {
                setContracts(data || []);
            }
        } catch (error) {
            console.error('Sözleşmeler yüklenemedi:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (contract?: Contract) => {
        if (contract) {
            setEditingContract(contract);
            setFormData({
                customerName: contract.customerName,
                customerLogo: contract.customerLogo || '',
                hasFrontend: contract.hasFrontend,
                hasBackend: contract.hasBackend,
                hasSocialMedia: contract.hasSocialMedia,
                hasPrintMedia: contract.hasPrintMedia,
                contractDate: contract.contractDate,
                monthlyPayment: contract.monthlyPayment,
                assignees: contract.assignees || []
            });
        } else {
            setEditingContract(null);
            setFormData({
                customerName: '',
                customerLogo: '',
                hasFrontend: false,
                hasBackend: false,
                hasSocialMedia: false,
                hasPrintMedia: false,
                contractDate: new Date().toISOString().split('T')[0],
                monthlyPayment: 0,
                assignees: []
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingContract(null);
    };

    const handleAssigneeToggle = (assignee: string) => {
        setFormData(prev => ({
            ...prev,
            assignees: prev.assignees.includes(assignee)
                ? prev.assignees.filter(a => a !== assignee)
                : [...prev.assignees, assignee]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingContract) {
                const { error } = await supabase
                    .from('contracts')
                    .update(formData)
                    .eq('id', editingContract.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('contracts')
                    .insert([formData]);
                if (error) throw error;
            }
            await fetchContracts();
            handleCloseModal();
        } catch (error: any) {
            alert('Sözleşme kaydedilirken bir hata oluştu. Veritabanı tablosu oluşturulmamış olabilir. ' + (error.message || error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu sözleşmeyi silmek istediğinize emin misiniz?')) return;
        try {
            const { error } = await supabase
                .from('contracts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchContracts();
        } catch (error: any) {
            alert('Sözleşme silinirken bir hata oluştu: ' + (error.message || error));
        }
    };

    const filteredContracts = contracts.filter(c =>
        c.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold">Sözleşmeler</h1>
                    <p className="text-slate-500 mt-1">Müşteri sözleşmelerini ve finansal bilgileri buradan yönetin.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-blue-600/20"
                >
                    <Plus className="w-5 h-5" /> Yeni Sözleşme
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm flex items-center gap-2">
                <Search className="w-5 h-5 text-slate-400 ml-2" />
                <input
                    type="text"
                    placeholder="Müşteri adına göre ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:outline-none text-slate-900 dark:text-white px-2 py-2"
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <span className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></span>
                </div>
            ) : filteredContracts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm glass-card">
                    <FileSignature className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-1">Henüz Sözleşme Yok</h3>
                    <p className="text-slate-500 mb-4">Yeni bir sözleşme oluşturarak başlayabilirsiniz.</p>
                    <button onClick={() => handleOpenModal()} className="text-blue-600 font-medium hover:underline cursor-pointer">Yeni Sözleşme Oluştur</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContracts.map(contract => {
                        const startDate = new Date(contract.contractDate);
                        const endDate = new Date(startDate);
                        endDate.setFullYear(startDate.getFullYear() + 1);
                        const today = new Date();

                        const totalTime = endDate.getTime() - startDate.getTime();
                        let elapsedTime = today.getTime() - startDate.getTime();

                        if (elapsedTime < 0) elapsedTime = 0;
                        if (elapsedTime > totalTime) elapsedTime = totalTime;

                        const progressPercentage = (elapsedTime / totalTime) * 100;
                        const remainingDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        const isExpired = remainingDays <= 0;
                        const isWarning = remainingDays > 0 && remainingDays <= 30;

                        return (
                            <div key={contract.id} className="glass-card flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-colors group">
                                <div className="p-5 flex justify-between items-start gap-4">
                                    <div className="flex items-center gap-3">
                                        {contract.customerLogo ? (
                                            <img src={contract.customerLogo} alt={contract.customerName} className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-100 p-1" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                {contract.customerName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white text-lg leading-tight">
                                                {contract.customerName}
                                            </h3>
                                            <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                                                <Calendar className="w-3 h-3" />
                                                {startDate.toLocaleDateString('tr-TR')} - {endDate.toLocaleDateString('tr-TR')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenModal(contract)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(contract.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700/50">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Sözleşme Süresi
                                        </span>
                                        <span className={`text-xs font-bold ${isExpired ? 'text-red-600' : isWarning ? 'text-orange-500' : 'text-blue-600'
                                            }`}>
                                            {isExpired ? 'Süresi Doldu' : `${remainingDays} gün kaldı`}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isExpired ? 'bg-red-500' : isWarning ? 'bg-orange-400' : 'bg-blue-500'
                                                }`}
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800 flex-1">
                                    <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Hizmetler</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {contract.hasFrontend && <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md font-medium">Front-End</span>}
                                        {contract.hasBackend && <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md font-medium">Back-End</span>}
                                        {contract.hasSocialMedia && <span className="px-2 py-1 bg-pink-50 text-pink-700 text-xs rounded-md font-medium">Sosyal Medya</span>}
                                        {contract.hasPrintMedia && <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-md font-medium">Basılı İşler</span>}
                                        {(!contract.hasFrontend && !contract.hasBackend && !contract.hasSocialMedia && !contract.hasPrintMedia) && (
                                            <span className="text-sm text-slate-400 italic">Hizmet seçilmemiş</span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-slate-400 mb-1">Aylık Ödeme</p>
                                            <div className="flex items-center gap-1 text-slate-900 dark:text-white font-semibold">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                {contract.monthlyPayment.toLocaleString('tr-TR')} ₺
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-400 mb-1">Sorumlular</p>
                                            <div className="flex items-center gap-1 text-slate-700 text-sm">
                                                <Users className="w-4 h-4 text-blue-500" />
                                                <span className="truncate">{contract.assignees?.join(', ') || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Contract Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur z-10">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <FileSignature className="w-5 h-5 text-blue-500" />
                                {editingContract ? 'Sözleşmeyi Düzenle' : 'Yeni Sözleşme Ekle'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            <form id="contractForm" onSubmit={handleSubmit} className="space-y-6">
                                {/* Customer Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Müşteri Adı</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.customerName}
                                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            placeholder="Örn: Acme Corp"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Müşteri Logosu (URL)</label>
                                        <input
                                            type="url"
                                            value={formData.customerLogo}
                                            onChange={e => setFormData({ ...formData, customerLogo: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                {/* Services */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hizmetler (Var / Yok)</label>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        {[
                                            { key: 'hasFrontend', label: 'Front-End' },
                                            { key: 'hasBackend', label: 'Back-End' },
                                            { key: 'hasSocialMedia', label: 'Sosyal Medya' },
                                            { key: 'hasPrintMedia', label: 'Basılı İşler' },
                                        ].map(service => (
                                            <div key={service.key} className="flex flex-col">
                                                <span className="text-xs text-slate-500 mb-1.5">{service.label}</span>
                                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, [service.key]: true })}
                                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${formData[service.key as keyof typeof formData]
                                                            ? 'bg-white shadow-sm text-blue-600'
                                                            : 'text-slate-500 hover:text-slate-700'
                                                            }`}
                                                    >
                                                        Var
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, [service.key]: false })}
                                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${!formData[service.key as keyof typeof formData]
                                                            ? 'bg-white shadow-sm text-slate-800'
                                                            : 'text-slate-500 hover:text-slate-700'
                                                            }`}
                                                    >
                                                        Yok
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Contract Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sözleşme Tarihi</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.contractDate}
                                            onChange={e => setFormData({ ...formData, contractDate: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Aylık Ödeme (₺)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.monthlyPayment || ''}
                                            onChange={e => setFormData({ ...formData, monthlyPayment: Number(e.target.value) })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {/* Assignees */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sorumlular</label>
                                    <div className="flex flex-wrap gap-3">
                                        {ASSIGNEES.map(assignee => {
                                            const isSelected = formData.assignees.includes(assignee);
                                            return (
                                                <button
                                                    key={assignee}
                                                    type="button"
                                                    onClick={() => handleAssigneeToggle(assignee)}
                                                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${isSelected
                                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {assignee}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 z-10">
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
                                form="contractForm"
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

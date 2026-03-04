import { useState } from 'react';
import { Plus, Filter, Edit2, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { SubscriptionModal } from '../components/subscriptions/SubscriptionModal';

export function Subscriptions() {
    const { subscriptions, loading, error, deleteSubscription } = useSubscriptions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<any>(null);

    // Calculate statistics
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

    const totalMonthly = activeSubscriptions.reduce((sum, sub) => {
        if (sub.billing_cycle === 'monthly') return sum + sub.amount;
        if (sub.billing_cycle === 'yearly') return sum + (sub.amount / 12);
        return sum;
    }, 0);

    const totalYearly = activeSubscriptions.reduce((sum, sub) => {
        if (sub.billing_cycle === 'yearly') return sum + sub.amount;
        if (sub.billing_cycle === 'monthly') return sum + (sub.amount * 12);
        return sum;
    }, 0);

    const handleEdit = (subscription: any) => {
        setEditingSubscription(subscription);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bu aboneliği silmek istediğinize emin misiniz?')) {
            await deleteSubscription(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSubscription(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                Hata: {error}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Üyelik ve Abonelikler</h1>
                    <p className="text-sm text-slate-500 mt-1">Düzenli giderlerinizi ve aboneliklerinizi yönetin.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Abonelik
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                        <h3 className="font-medium text-slate-500 dark:text-slate-400">Aylık Toplam Gider</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        {totalMonthly.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">Yıllık aboneliklerin aylık yansıması dahildir.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                            <ArrowDownRight className="w-5 h-5" />
                        </div>
                        <h3 className="font-medium text-slate-500 dark:text-slate-400">Yıllık Toplam Gider</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        {totalYearly.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">Aylık aboneliklerin 12 aylık projeksiyonu dahildir.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                            <Filter className="w-5 h-5" />
                            {/* Just an icon placeholder */}
                        </div>
                        <h3 className="font-medium text-slate-500 dark:text-slate-400">Aktif Abonelik</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        {activeSubscriptions.length}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">Toplam {subscriptions.length} kayıt arasından.</p>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="font-semibold text-slate-800 dark:text-slate-200">Abonelik Listesi</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-800">
                                <th className="p-4 font-medium">Hizmet Adı</th>
                                <th className="p-4 font-medium">Kategori</th>
                                <th className="p-4 font-medium">Tutar</th>
                                <th className="p-4 font-medium">Döngü</th>
                                <th className="p-4 font-medium">Başlangıç</th>
                                <th className="p-4 font-medium">Durum</th>
                                <th className="p-4 font-medium text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">
                                        Henüz bir abonelik eklenmemiş.
                                    </td>
                                </tr>
                            ) : (
                                subscriptions.map((sub) => (
                                    <tr key={sub.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{sub.name}</div>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">
                                            {sub.category || '-'}
                                        </td>
                                        <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                                            {sub.amount.toLocaleString('tr-TR', { style: 'currency', currency: sub.currency })}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sub.billing_cycle === 'monthly' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'}`}>
                                                {sub.billing_cycle === 'monthly' ? 'Aylık' : 'Yıllık'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">
                                            {new Date(sub.start_date).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sub.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300'}`}>
                                                {sub.status === 'active' ? 'Aktif' : 'İptal Edildi'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(sub)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(sub.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <SubscriptionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editingSubscription={editingSubscription}
            />
        </div>
    );
}

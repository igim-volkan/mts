import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, LayoutDashboard, PlusCircle, FileText, FileSignature, LogOut, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Müşteriler', path: '/leads', icon: Users },
        { name: 'Üyelik ve Abonelikler', path: '/subscriptions', icon: CreditCard },
        { name: 'E-posta Metinleri', path: '/templates', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 glass border-r md:min-h-screen p-6 flex flex-col gap-8 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white leading-tight">Lead Tracker</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">CRM System</p>
                    </div>
                </div>

                <nav className="flex-1 flex flex-col gap-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'opacity-70'}`} />
                                {item.name}
                            </Link>
                        );
                    })}

                    <div className="my-2 border-t border-slate-200 dark:border-slate-800"></div>

                    <Link
                        to="/contracts"
                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm ${location.pathname.startsWith('/contracts')
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30'
                                : 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 text-amber-700 dark:text-amber-500 border border-amber-200/50 dark:border-amber-500/20 hover:shadow-md hover:scale-[1.02]'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <FileSignature className={`w-5 h-5 ${location.pathname.startsWith('/contracts') ? 'text-white' : 'text-amber-600 dark:text-amber-500'}`} />
                            Sözleşmeler
                        </div>
                        <div className={`w-2 h-2 rounded-full ${location.pathname.startsWith('/contracts') ? 'bg-white' : 'bg-amber-500 animate-pulse'}`}></div>
                    </Link>
                </nav>

                <div className="mt-auto pt-6 flex flex-col gap-2">
                    <Link
                        to="/leads/new"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${location.pathname === '/leads/new'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        <PlusCircle className={`w-5 h-5 ${location.pathname === '/leads/new' ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`} />
                        Yeni Müşteri Ekle
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                    >
                        <LogOut className="w-5 h-5 opacity-70" />
                        Çıkış Yap
                    </button>
                    {user?.email && (
                        <div className="px-4 mt-2 text-xs text-slate-400 dark:text-slate-500 truncate">
                            {user.email}
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-[1600px] mx-auto">
                <Outlet />
            </main>
        </div>
    );
}

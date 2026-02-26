import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, LayoutDashboard, PlusCircle, FileText } from 'lucide-react';

export function MainLayout() {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Müşteriler', path: '/leads', icon: Users },
        { name: 'Yeni Ekle', path: '/leads/new', icon: PlusCircle },
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
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-[1600px] mx-auto">
                <Outlet />
            </main>
        </div>
    );
}

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, History, Settings } from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Moje Budżety', href: '/limits', icon: Wallet },
    { name: 'Historia Zakupów', href: '/logs', icon: History },
    { name: 'Ustawienia', href: '/settings', icon: Settings },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-white/10 bg-zinc-900/50 backdrop-blur-xl px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center mt-4">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    My Budget App
                </h1>
            </div>
            <nav className="flex flex-1 flex-col mt-4">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-2">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={classNames(
                                                isActive
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]'
                                                    : 'text-slate-400 hover:text-emerald-400 hover:bg-zinc-800/50 border border-transparent',
                                                'group flex gap-x-3 rounded-xl p-2.5 text-sm leading-6 font-medium transition-all duration-300 backdrop-blur-sm'
                                            )}
                                        >
                                            <item.icon
                                                className={classNames(
                                                    isActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-slate-500 group-hover:text-emerald-400',
                                                    'h-6 w-6 shrink-0 transition-all duration-300'
                                                )}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

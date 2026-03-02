'use client';

import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet, AlertTriangle, CheckCircle2, XCircle, ChevronRight, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';



function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface LogItem {
  name: string;
  quantity: number;
  price: number;
  productId: string;
  image?: string;
  productUrl?: string;
}

interface Log {
  _id: string;
  orderId: string;
  orderName: string;
  category: string;
  amount: number;
  currency: string;
  status: string;
  reason?: string;
  items?: LogItem[];
  createdAt: string;
}

export default function Dashboard() {
  const [recentLogs, setRecentLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Log | null>(null);
  const [summaryStats, setSummaryStats] = useState({
    totalSpent: 0,
    remainingBudget: 0,
    budgetCategoriesCount: 0,
    blockedPurchasesCount: 0,
    currency: 'PLN'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, summaryRes] = await Promise.all([
          fetch('/api/logs'),
          fetch('/api/summary')
        ]);

        const logsJson = await logsRes.json();
        if (logsJson.success) {
          // Only show top 5 on dashboard
          setRecentLogs(logsJson.data.slice(0, 5));
        }

        const summaryJson = await summaryRes.json();
        if (summaryJson.success) {
          setSummaryStats(summaryJson.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRowClick = (log: Log) => {
    if (log.items && log.items.length > 0) {
      setSelectedOrder(log);
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const dashboardStats = [
    { name: 'Wydano', value: `${summaryStats.totalSpent.toLocaleString()} ${summaryStats.currency}`, change: '', changeType: 'positive', icon: DollarSign },
    { name: 'Kategorie Budżetowe', value: summaryStats.budgetCategoriesCount.toString(), change: '', changeType: 'positive', icon: Wallet },
    { name: 'Zablokowane Zakupy (Miesiąc)', value: summaryStats.blockedPurchasesCount.toString(), change: '', changeType: 'negative', icon: AlertTriangle },
    { name: 'Pozostały Budżet', value: `${summaryStats.remainingBudget.toLocaleString()} ${summaryStats.currency}`, change: '', changeType: 'positive', icon: DollarSign },
  ];

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-bold leading-7 text-white sm:truncate sm:tracking-tight">
            Twój Budżet
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Monitoruj własne wydatki i pilnuj limitów.
          </p>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((item) => (
          <div
            key={item.name}
            className="group relative overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-md px-4 pb-12 pt-5 shadow-xl ring-1 ring-white/10 sm:px-6 sm:pt-6 hover:bg-zinc-800/60 hover:ring-emerald-500/30 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)] transition-all duration-300"
          >
            <dt>
              <div className="absolute rounded-xl bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors duration-300">
                <item.icon className="h-6 w-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-slate-400">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              {isLoading ? (
                <div className="h-9 w-24 bg-zinc-800 animate-pulse rounded"></div>
              ) : (
                <p className="text-3xl font-semibold text-white tracking-tight">{item.value}</p>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <h3 className="text-lg font-medium leading-6 text-slate-200">Ostatnie Zakupy</h3>
        <div className="mt-4 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow-xl ring-1 ring-white/10 md:rounded-2xl bg-zinc-900/40 backdrop-blur-md">
                <table className="min-w-full divide-y divide-white/5">
                  <thead className="bg-zinc-800/30">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-300 sm:pl-6">
                        Skład
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-300">
                        Kategoria
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-300">
                        Kwota
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-300">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-300">
                        Data
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Więcej</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sm font-semibold text-slate-500">
                          Ładowanie ostatnich zakupów...
                        </td>
                      </tr>
                    ) : recentLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sm font-semibold text-slate-400">
                          Brak historii transakcji w tym miesiącu.
                        </td>
                      </tr>
                    ) : recentLogs.map((log) => {
                      const hasItems = log.items && log.items.length > 0;
                      return (
                        <tr
                          key={log._id}
                          onClick={() => handleRowClick(log)}
                          className={`transition-colors duration-200 ${hasItems ? 'cursor-pointer hover:bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-slate-400 sm:pl-6">
                            {hasItems ? (
                              <div className="flex -space-x-2">
                                {log.items!.slice(0, 3).map((item, idx) => (
                                  <div key={idx} className="relative z-0 h-8 w-8 rounded-full ring-2 ring-zinc-900 bg-zinc-800 flex items-center justify-center overflow-hidden">
                                    {item.image ? (
                                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                    ) : (
                                      <span className="text-[10px] text-slate-500">Brak</span>
                                    )}
                                  </div>
                                ))}
                                {log.items!.length > 3 && (
                                  <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 ring-2 ring-zinc-900">
                                    <span className="text-xs font-medium text-white">+{log.items!.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="font-medium text-slate-200">{log.orderName}</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-400">
                            {log.category}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-200">
                            {log.amount.toLocaleString()} {log.currency}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-400">
                            {log.status === 'BLOCKED' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400 ring-1 ring-inset ring-rose-500/20 shadow-[0_0_10px_-3px_rgba(244,63,94,0.2)]">
                                <XCircle className="h-4 w-4 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]" />
                                Odłożone (Limit)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20 shadow-[0_0_10px_-3px_rgba(16,185,129,0.2)]">
                                <CheckCircle2 className="h-4 w-4 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                Zaakceptowane
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                            {new Date(log.createdAt).toLocaleString('pl-PL', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            {hasItems && (
                              <ChevronRight className="h-5 w-5 text-slate-500 ml-auto" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal (Same as Logs page) */}
      {selectedOrder && (
        <div className="relative z-50 animate-in fade-in duration-200" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity" onClick={closeModal} />

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 shadow-[0_0_50px_-12px_rgba(16,185,129,0.15)]">

                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-md bg-zinc-900 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                  >
                    <span className="sr-only">Zamknij</span>
                    <XCircle className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div>
                  <div className="mt-3 text-left sm:mt-0">
                    <h3 className="text-2xl font-bold leading-6 text-white" id="modal-title">
                      Szczegóły {selectedOrder.orderName}
                    </h3>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-sm text-slate-400">
                        Kwota: <span className="text-slate-200 font-medium">{selectedOrder.amount.toLocaleString()} {selectedOrder.currency}</span>
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-sm text-slate-400">
                        Data: <span className="text-slate-200 font-medium">{new Date(selectedOrder.createdAt).toLocaleString('pl-PL')}</span>
                      </span>
                    </div>

                    {selectedOrder.reason && selectedOrder.status === 'BLOCKED' && (
                      <div className="mt-4 rounded-lg bg-rose-500/10 p-3 border border-rose-500/20">
                        <p className="text-sm text-rose-400 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          {selectedOrder.reason}
                        </p>
                      </div>
                    )}

                    <div className="mt-6 border-t border-white/10 pt-6">
                      <h4 className="text-sm font-medium text-slate-300 mb-4 uppercase tracking-wider">Zakupione pozycje</h4>

                      <ul role="list" className="divide-y divide-white/5 border-b border-white/10">
                        {selectedOrder.items?.map((item, idx) => (
                          <li key={idx} className="flex py-4">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800 border border-white/5">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover object-center"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                                  Brak<br />Zdjęcia
                                </div>
                              )}
                            </div>

                            <div className="ml-4 flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-white">
                                  <h5 className="truncate max-w-[200px] sm:max-w-xs" title={item.name}>
                                    {item.name}
                                  </h5>
                                  <p className="ml-4 tabular-nums">
                                    {item.price.toLocaleString()} {selectedOrder.currency}
                                  </p>
                                </div>
                                <p className="mt-1 text-sm text-slate-400">Ilość: {item.quantity}</p>
                              </div>
                              <div className="flex flex-1 items-end justify-between text-sm">
                                <div className="flex">
                                  {item.productUrl ? (
                                    <a
                                      href={item.productUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                                    >
                                      <span>Zobacz w Shopify</span>
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  ) : (
                                    <span className="text-slate-500 italic text-xs">Aukcja niedostępna</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mt-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-xl bg-zinc-800 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-white/10 hover:bg-zinc-700 sm:mt-0 sm:w-auto"
                    onClick={closeModal}
                  >
                    Zamknij
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

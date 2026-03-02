'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface Limit {
    _id: string;
    name: string;
    category: string;
    monthlyLimit: number;
    currentSpent: number;
    currency: string;
}

export default function LimitsPage() {
    const [limits, setLimits] = useState<Limit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        monthlyLimit: '',
        currency: 'PLN'
    });

    const fetchLimits = async () => {
        try {
            const res = await fetch('/api/limits');
            const json = await res.json();
            if (json.success) {
                setLimits(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch limits:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLimits();
    }, []);

    const handleOpenModal = (limit?: Limit) => {
        if (limit) {
            setEditingId(limit._id);
            setFormData({
                name: limit.name,
                category: limit.category,
                monthlyLimit: limit.monthlyLimit.toString(),
                currency: limit.currency
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', category: '', monthlyLimit: '', currency: 'PLN' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = editingId ? `/api/limits/${editingId}` : '/api/limits';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    category: formData.category.toLowerCase().replace(/\s+/g, '-'),
                    monthlyLimit: Number(formData.monthlyLimit),
                    currency: formData.currency
                })
            });
            const json = await res.json();
            if (json.success) {
                await fetchLimits();
                handleCloseModal();
            } else {
                alert(json.error || 'Failed to save limit');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Wystąpił błąd przy zapisywaniu limitu.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Czy na pewno chcesz usunąć budżet "${name}"?`)) {
            return;
        }

        // Optimistic UI update
        setIsDeleting(id);
        const previousLimits = [...limits];
        setLimits(limits.filter(limit => limit._id !== id));

        try {
            const res = await fetch(`/api/limits/${id}`, {
                method: 'DELETE',
            });
            const json = await res.json();
            if (!json.success) {
                // Revert if failed
                setLimits(previousLimits);
                alert(json.error || 'Failed to delete limit');
            }
        } catch (error) {
            console.error('Delete error:', error);
            // Revert if failed
            setLimits(previousLimits);
            alert('Wystąpił błąd przy usuwaniu limitu.');
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h2 className="text-3xl font-bold leading-7 text-white sm:truncate sm:tracking-tight">
                        Moje Budżety
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Zarządzaj swoimi limitami na konkretne kategorie zakupów (np. Odzież, Uroda, lub po prostu Budżet Ogólny).
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => handleOpenModal()}
                        className="block rounded-lg bg-emerald-500/10 px-4 py-2 text-center text-sm font-semibold text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] hover:bg-emerald-500/20 hover:text-emerald-300 hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 flex items-center gap-2 transition-all duration-300"
                    >
                        <Plus className="h-4 w-4 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                        Dodaj Budżet
                    </button>
                </div>
            </div>

            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow-xl ring-1 ring-white/10 sm:rounded-2xl bg-zinc-900/40 backdrop-blur-md">
                            <table className="min-w-full divide-y divide-white/5">
                                <thead className="bg-zinc-800/30">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-300 sm:pl-6">
                                            Nazwa Budżetu
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-300">
                                            Kategoria
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-300">
                                            Twój Miesięczny Limit
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-300">
                                            Wykorzystano
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-300">
                                            Status
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Akcje</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-sm font-semibold text-slate-500">
                                                Ładowanie...
                                            </td>
                                        </tr>
                                    ) : limits.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-sm font-semibold text-slate-400">
                                                Brak budżetów. Kliknij "Dodaj Budżet", aby utworzyć kontrolę wydatków!
                                            </td>
                                        </tr>
                                    ) : limits.map((limit) => {
                                        const percentage = Math.min(100, (limit.currentSpent / limit.monthlyLimit) * 100);
                                        const isDanger = percentage >= 90;

                                        return (
                                            <tr key={limit._id} className="hover:bg-white/[0.02] transition-colors duration-200">
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                    <div className="font-medium text-slate-200">{limit.name}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-400">
                                                    <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-slate-300 ring-1 ring-inset ring-white/10">
                                                        {limit.category}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300 font-semibold">
                                                    {limit.monthlyLimit.toLocaleString()} {limit.currency}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-400 w-64">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-white">{limit.currentSpent.toLocaleString()} {limit.currency}</span>
                                                        <span className={isDanger ? 'text-rose-400 font-bold drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]' : 'text-slate-300'}>{percentage.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full bg-zinc-800 rounded-full h-1.5 ring-1 ring-white/5 overflow-hidden">
                                                        <div
                                                            className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${isDanger ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-400">
                                                    {isDanger ? (
                                                        <span className="inline-flex items-center rounded-md bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-400 ring-1 ring-inset ring-rose-500/20 shadow-[0_0_10px_-3px_rgba(244,63,94,0.2)]">
                                                            Limit Napięty
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20 shadow-[0_0_10px_-3px_rgba(16,185,129,0.2)]">
                                                            W Normie
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <div className="flex justify-end gap-3">
                                                        {isDeleting === limit._id ? (
                                                            <span className="text-slate-400 text-xs flex items-center gap-1">
                                                                <span className="w-3 h-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin"></span>
                                                                Usuwanie...
                                                            </span>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleOpenModal(limit)}
                                                                    className="text-emerald-400 hover:text-emerald-300 hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all"
                                                                    title="Edytuj Limit"
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(limit._id, limit.name)}
                                                                    className="text-rose-400 hover:text-rose-300 hover:drop-shadow-[0_0_8px_rgba(244,63,94,0.5)] transition-all"
                                                                    title="Usuń Limit"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
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

            {/* Modal */}
            {isModalOpen && (
                <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" aria-hidden="true" />

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-2xl bg-zinc-900 px-4 pb-4 pt-5 text-left shadow-2xl ring-1 ring-white/10 transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <form onSubmit={handleSubmit}>
                                    <div>
                                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                            <h3 className="text-lg font-semibold leading-6 text-white" id="modal-title">
                                                {editingId ? 'Edytuj Budżet' : 'Dodaj Nowy Budżet'}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={handleCloseModal}
                                                className="text-slate-400 hover:text-slate-300 transition-colors"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300">
                                                    Nazwa Budżetu
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="block w-full rounded-xl border-white/10 bg-zinc-800/50 text-white shadow-inner focus:border-emerald-500 focus:ring-emerald-500/50 sm:text-sm px-3 py-2 border placeholder-slate-500"
                                                        placeholder="np. Miesięczne ciuchy"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300">
                                                    Kategoria (Slug)
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.category}
                                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                        className="block w-full rounded-xl border-white/10 bg-zinc-800/50 text-white shadow-inner focus:border-emerald-500 focus:ring-emerald-500/50 sm:text-sm px-3 py-2 border placeholder-slate-500"
                                                        placeholder="np. ubrania, ogolne"
                                                    />
                                                </div>
                                                <p className="mt-1 text-xs text-slate-500">Unikalny identyfikator kategorii bez spacji (np. "general"). Zamówienia z webhooka Shopify wpadają domyślnie w "general".</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300">
                                                    Miesięczny Limit
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        step="0.01"
                                                        value={formData.monthlyLimit}
                                                        onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
                                                        className="block w-full rounded-xl border-white/10 bg-zinc-800/50 text-white shadow-inner focus:border-emerald-500 focus:ring-emerald-500/50 sm:text-sm px-3 py-2 border placeholder-slate-500"
                                                        placeholder="np. 500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300">
                                                    Waluta
                                                </label>
                                                <div className="mt-1">
                                                    <select
                                                        required
                                                        value={formData.currency}
                                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                                        className="block w-full rounded-xl border-white/10 bg-zinc-800/50 text-white shadow-inner focus:border-emerald-500 focus:ring-emerald-500/50 sm:text-sm px-3 py-2 border [&>option]:bg-zinc-800"
                                                    >
                                                        <option value="PLN">PLN</option>
                                                        <option value="EUR">EUR</option>
                                                        <option value="USD">USD</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 sm:mt-8 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="inline-flex w-full justify-center rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-white shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 sm:col-start-2 disabled:opacity-50 transition-all duration-300"
                                        >
                                            {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="mt-3 inline-flex w-full justify-center rounded-xl bg-white/5 px-3 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-white/10 hover:bg-white/10 sm:col-start-1 sm:mt-0 transition-all duration-300"
                                        >
                                            Anuluj
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

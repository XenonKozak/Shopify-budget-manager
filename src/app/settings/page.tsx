export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="border-b border-white/10 pb-5">
                <h3 className="text-3xl font-bold leading-7 text-white sm:truncate sm:tracking-tight">Ustawienia</h3>
                <p className="mt-2 max-w-4xl text-sm text-slate-400">
                    Zarządzaj konfiguracją integracji z Shopify oraz ustawieniami aplikacji.
                </p>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-md shadow-xl ring-1 ring-white/10 sm:rounded-2xl">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-semibold leading-6 text-white">Konfiguracja Shopify API</h3>
                    <div className="mt-2 max-w-2xl text-sm text-slate-400">
                        <p>
                            Uzupełnij klucze API dla sklepu Shopify, aby aplikacja mogła automatycznie weryfikować zamówienia
                            i aktualizować budżety osobiste.
                        </p>
                    </div>
                    <form className="mt-5 sm:flex sm:items-center">
                        <div className="w-full max-w-md sm:max-w-xs space-y-4">
                            <div>
                                <label htmlFor="shop-url" className="block text-sm font-medium text-slate-300">
                                    Adres sklepu (URL)
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="shop-url"
                                        id="shop-url"
                                        className="block w-full rounded-xl border-white/10 bg-zinc-800/50 text-white shadow-inner focus:border-emerald-500 focus:ring-emerald-500/50 sm:text-sm px-3 py-2 border placeholder-slate-500 transition-all duration-300"
                                        placeholder="moj-sklep.myshopify.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="access-token" className="block text-sm font-medium text-slate-300">
                                    Admin API Access Token
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="password"
                                        name="access-token"
                                        id="access-token"
                                        className="block w-full rounded-xl border-white/10 bg-zinc-800/50 text-white shadow-inner focus:border-emerald-500 focus:ring-emerald-500/50 sm:text-sm px-3 py-2 border placeholder-slate-500 transition-all duration-300"
                                        placeholder="shpat_..."
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 sm:mt-0 sm:ml-4 sm:flex-shrink-0 self-end">
                            <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 transition-all duration-300"
                            >
                                Zapisz
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

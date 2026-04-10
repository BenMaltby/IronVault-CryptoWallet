'use client';

import {useState} from 'react';

export default function ExportWalletBackupForm() {
    const [walletId, setWalletId] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [backupPassword, setBackupPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [backupJson, setBackupJson] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setBackupJson('');

        try {
            const res = await fetch(`/api/wallet/${walletId}/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    passphrase,
                    backupPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data?.error?.formErrors?.[0] || data?.error || 'Failed to export backup.');
                return;
            }

            setBackupJson(JSON.stringify(data.backup, null, 2));
        } catch {
            setError('Unexpected error while exporting wallet backup.');
        } finally {
            setLoading(false);
        }
    }

    async function copyBackup() {
        if (!backupJson) return;
        await navigator.clipboard.writeText(backupJson);
    }

    function downloadBackup() {
        if (!backupJson) return;

        const blob = new Blob([backupJson], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wallet-backup-${walletId || 'export'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm text-zinc-300">Wallet ID</label>
                <input
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                    placeholder="Paste wallet ID"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm text-zinc-300">Wallet Passphrase</label>
                <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                    placeholder="Wallet passphrase"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm text-zinc-300">Backup Password</label>
                <input
                    type="password"
                    value={backupPassword}
                    onChange={(e) => setBackupPassword(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                    placeholder="Password for exported backup"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-white px-4 py-3 font-medium text-black disabled:opacity-50"
            >
                {loading ? 'Exporting...' : 'Export Encrypted Backup'}
            </button>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            {backupJson ? (
                <div className="space-y-3">
                    <p className="text-sm text-emerald-400">
                        Backup generated successfully. Store it securely.
                    </p>

                    <textarea
                        readOnly
                        value={backupJson}
                        className="min-h-[280px] w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-mono text-sm text-zinc-200 outline-none"
                    />

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={copyBackup}
                            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white"
                        >
                            Copy JSON
                        </button>

                        <button
                            type="button"
                            onClick={downloadBackup}
                            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white"
                        >
                            Download JSON
                        </button>
                    </div>
                </div>
            ) : null}
        </form>
    );
}

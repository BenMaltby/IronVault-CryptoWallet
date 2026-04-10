'use client';

import {useState} from 'react';

export default function ImportWalletBackupForm() {
    const [backupPassword, setBackupPassword] = useState('');
    const [walletPassphrase, setWalletPassphrase] = useState('');
    const [backupJson, setBackupJson] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [walletInfo, setWalletInfo] = useState<null | {
        id: string;
        name: string;
        network: string;
        addresses: Array<{
            label: string;
            address: string;
            network: string;
        }>;
        createdAt: string;
    }>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        setWalletInfo(null);

        try {
            const parsedBackup = JSON.parse(backupJson);

            const res = await fetch('/api/wallet/import-backup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    backupPassword,
                    walletPassphrase,
                    backup: parsedBackup,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data?.error?.formErrors?.[0] || data?.error || 'Failed to import backup.');
                return;
            }

            setSuccess(data.message || 'Encrypted wallet backup imported successfully.');
            setWalletInfo(data.wallet);
            setBackupPassword('');
            setWalletPassphrase('');
        } catch {
            setError('Backup JSON is invalid or import failed.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm text-zinc-300">Backup Password</label>
                <input
                    type="password"
                    value={backupPassword}
                    onChange={(e) => setBackupPassword(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                    placeholder="Backup password"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm text-zinc-300">New Wallet Passphrase</label>
                <input
                    type="password"
                    value={walletPassphrase}
                    onChange={(e) => setWalletPassphrase(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                    placeholder="New passphrase for the restored wallet"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm text-zinc-300">Encrypted Backup JSON</label>
                <textarea
                    value={backupJson}
                    onChange={(e) => setBackupJson(e.target.value)}
                    className="min-h-[280px] w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-mono text-sm text-white outline-none"
                    placeholder="Paste the exported encrypted backup JSON here"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-white px-4 py-3 font-medium text-black disabled:opacity-50"
            >
                {loading ? 'Importing Backup...' : 'Import From Backup'}
            </button>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-400">{success}</p> : null}

            {walletInfo ? (
                <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-sm text-zinc-300">
                    <p><span className="font-medium text-white">Wallet ID:</span> {walletInfo.id}</p>
                    <p><span className="font-medium text-white">Name:</span> {walletInfo.name}</p>
                    <p><span className="font-medium text-white">Network:</span> {walletInfo.network}</p>
                    <p>
                        <span className="font-medium text-white">Primary Address:</span>{' '}
                        {walletInfo.addresses?.[0]?.address ?? 'N/A'}
                    </p>
                </div>
            ) : null}
        </form>
    );
}

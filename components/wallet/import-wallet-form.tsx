'use client';

import {useState} from 'react';

const NETWORK_OPTIONS = [
    'Ethereum Sepolia',
    'Polygon Amoy',
    'Base Sepolia',
] as const;

export default function ImportWalletForm() {
    const [walletName, setWalletName] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [network, setNetwork] = useState<(typeof NETWORK_OPTIONS)[number]>('Ethereum Sepolia');
    const [recoveryPhrase, setRecoveryPhrase] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [response, setResponse] = useState<null | {
        wallet: {
            id: string;
            name: string;
            network: string;
            addresses: Array<{
                label: string;
                address: string;
                network: string;
            }>;
            createdAt: string;
        };
        message: string;
    }>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        setResponse(null);

        try {
            const res = await fetch('/api/wallet/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    walletName,
                    passphrase,
                    network,
                    recoveryPhrase,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data?.error?.formErrors?.[0] || data?.error || 'Failed to import wallet.');
                return;
            }

            setResponse(data);
            setSuccess(data.message || 'Wallet imported successfully.');
            setWalletName('');
            setPassphrase('');
            setRecoveryPhrase('');
            setNetwork('Ethereum Sepolia');
        } catch {
            setError('Unexpected error while importing wallet.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm text-zinc-300">Wallet Name</label>
                <input
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                    placeholder="Imported Wallet"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm text-zinc-300">Network</label>
                <select
                    value={network}
                    onChange={(e) =>
                        setNetwork(e.target.value as (typeof NETWORK_OPTIONS)[number])
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                >
                    {NETWORK_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-1 block text-sm text-zinc-300">Wallet Passphrase</label>
                <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                    placeholder="Minimum 14 characters"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm text-zinc-300">Recovery Phrase</label>
                <textarea
                    value={recoveryPhrase}
                    onChange={(e) => setRecoveryPhrase(e.target.value)}
                    className="min-h-[120px] w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
                    placeholder="Enter the wallet recovery phrase"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-white px-4 py-3 font-medium text-black disabled:opacity-50"
            >
                {loading ? 'Importing...' : 'Import Wallet'}
            </button>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-400">{success}</p> : null}

            {response?.wallet ? (
                <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-sm text-zinc-300">
                    <p><span className="font-medium text-white">Wallet ID:</span> {response.wallet.id}</p>
                    <p><span className="font-medium text-white">Name:</span> {response.wallet.name}</p>
                    <p><span className="font-medium text-white">Network:</span> {response.wallet.network}</p>
                    <p>
                        <span className="font-medium text-white">Primary Address:</span>{' '}
                        {response.wallet.addresses?.[0]?.address ?? 'N/A'}
                    </p>
                </div>
            ) : null}
        </form>
    );
}

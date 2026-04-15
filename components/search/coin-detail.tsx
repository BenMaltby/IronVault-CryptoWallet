'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, ShoppingCart, ArrowUpRight } from 'lucide-react';
import { formatCurrency, shortenAddress } from '@/lib/utils';
import type { CryptoCoin } from '@/lib/crypto-catalog';
import type { WalletOption, Contact, SupportedNetwork } from '@/types';
import type { LiveCoinData } from '@/app/api/crypto/route';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  if (price < 0.0001) return `$${price.toFixed(8)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  if (price < 1000) return `$${price.toFixed(2)}`;
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatLargeNumber(n: number): string {
  if (n >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(2)}T`;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = 'buy' | 'send';
type Step = 'input' | 'confirmation' | 'result';

const SUPPORTED_ASSETS = ['ETH', 'MATIC', 'USDC'] as const;
type SupportedAsset = (typeof SUPPORTED_ASSETS)[number];

const EXCHANGE_FEE_USD = 1.99;

// Send types
type SendFormData = {
  walletId: string;
  recipientAddress: string;
  network: SupportedNetwork;
  assetSymbol: string;
  amount: string;
  recipientSaved: boolean;
};

type SendDraft = {
  id: string;
  senderAddress: string | null;
  recipientAddress: string;
  network: string;
  assetSymbol: string;
  amount: number;
  estimatedFee: number;
  warnings: string[];
};

type SendResult = {
  id: string;
  txHash: string;
  status: string;
  amount: number;
  assetSymbol: string;
  network: string;
  recipientAddress: string | null;
};

// Buy types
type BuyFormData = {
  walletId: string;
  network: SupportedNetwork;
  usdAmount: string;
};

type BuyDraft = {
  id: string;
  walletName: string;
  assetSymbol: string;
  coinAmount: number;
  usdAmount: number;
  priceAtPurchase: number;
  network: string;
  fee: number;
};

type BuyResult = {
  id: string;
  txHash: string | null;
  status: string;
  coinAmount: number;
  assetSymbol: string;
  network: string;
};

interface Props {
  coin: CryptoCoin;
  wallets: WalletOption[];
  contacts: Contact[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CoinDetail({ coin, wallets, contacts }: Props) {
  const router = useRouter();

  const coinIsSupported = (SUPPORTED_ASSETS as readonly string[]).includes(coin.symbol);

  // ── Live price ──────────────────────────────────────────────────────────────
  const [price, setPrice] = useState(coin.price);
  const [change24h, setChange24h] = useState(coin.change24h);
  const [marketCap, setMarketCap] = useState(coin.marketCap);
  const [volume24h, setVolume24h] = useState(coin.volume24h);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('/api/crypto')
      .then((r) => r.json())
      .then((data: LiveCoinData[]) => {
        const live = Array.isArray(data) ? data.find((d) => d.id === coin.id) : null;
        if (live) {
          setPrice(live.price);
          setChange24h(live.change24h);
          setMarketCap(live.marketCap);
          setVolume24h(live.volume24h);
        }
      })
      .catch(() => {});
  }, [coin.id]);

  useEffect(() => {
    if (!coin.binanceSymbol) return;
    function connect() {
      const ws = new WebSocket(
        `wss://stream.binance.com:9443/ws/${coin.binanceSymbol!.toLowerCase()}@ticker`,
      );
      wsRef.current = ws;
      ws.onmessage = (event: MessageEvent) => {
        try {
          const d = JSON.parse(event.data as string) as { c: string; P: string };
          setPrice(parseFloat(d.c));
          setChange24h(parseFloat(d.P));
        } catch {}
      };
      ws.onclose = () => { reconnectRef.current = setTimeout(connect, 4_000); };
    }
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [coin.binanceSymbol]);

  // ── Mode ────────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>('buy');

  const firstWallet = wallets[0];

  // ── Send state ──────────────────────────────────────────────────────────────
  const [sendStep, setSendStep] = useState<Step>('input');
  const [sendForm, setSendForm] = useState<SendFormData>({
    walletId: firstWallet?.id ?? '',
    recipientAddress: '',
    network: (firstWallet?.network ?? 'Ethereum Sepolia') as SupportedNetwork,
    assetSymbol: coin.symbol,
    amount: '',
    recipientSaved: false,
  });
  const [selectedContactId, setSelectedContactId] = useState('');
  const [sendDraft, setSendDraft] = useState<SendDraft | null>(null);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [isSendSubmitting, setIsSendSubmitting] = useState(false);
  const [sendError, setSendError] = useState('');
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  // ── Buy state ───────────────────────────────────────────────────────────────
  const [buyStep, setBuyStep] = useState<Step>('input');
  const [buyForm, setBuyForm] = useState<BuyFormData>({
    walletId: firstWallet?.id ?? '',
    network: (firstWallet?.network ?? 'Ethereum Sepolia') as SupportedNetwork,
    usdAmount: '',
  });
  const [buyDraft, setBuyDraft] = useState<BuyDraft | null>(null);
  const [buyResult, setBuyResult] = useState<BuyResult | null>(null);
  const [isBuySubmitting, setIsBuySubmitting] = useState(false);
  const [buyError, setBuyError] = useState('');

  // ── Send helpers ────────────────────────────────────────────────────────────
  function getSelectedWallet() {
    return wallets.find((w) => w.id === sendForm.walletId);
  }

  function getSelectedWalletAssetBalance(): number {
    const w = getSelectedWallet();
    if (!w) return 0;
    const val = w.balances[sendForm.assetSymbol as SupportedAsset];
    return typeof val === 'number' ? val : 0;
  }

  function handleWalletChange(walletId: string) {
    const selected = wallets.find((w) => w.id === walletId);
    setSendForm((prev) => ({
      ...prev,
      walletId,
      network: selected?.network ?? prev.network,
    }));
  }

  function handleContactSelect(id: string) {
    if (id === '') {
      setSelectedContactId('');
      setSendForm((prev) => ({ ...prev, recipientAddress: '', recipientSaved: false }));
    } else {
      const contact = contacts.find((c) => c.id === id);
      if (contact) {
        setSelectedContactId(id);
        setSendForm((prev) => ({ ...prev, recipientAddress: contact.address, recipientSaved: true }));
      }
    }
  }

  function setQuickAmount(value: number) {
    setSendForm((prev) => ({
      ...prev,
      amount: value > 0 ? value.toFixed(4).replace(/\.?0+$/, '') : '',
    }));
  }

  function setMaxAmount() {
    const balance = getSelectedWalletAssetBalance();
    let estimatedFee = 0;
    if (sendForm.assetSymbol === 'ETH') estimatedFee = 0.001;
    else if (sendForm.assetSymbol === 'MATIC') estimatedFee = 0.01;
    const maxAmount = Math.max(balance - estimatedFee, 0);
    if (maxAmount <= 0) {
      setSendError('Not enough balance to cover network fees.');
      return;
    }
    setSendError('');
    setSendForm((prev) => ({
      ...prev,
      amount: maxAmount.toFixed(4).replace(/\.?0+$/, ''),
    }));
  }

  async function handleSendInitiate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSendError('');
    setIsSendSubmitting(true);
    try {
      const response = await fetch('/api/transactions/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sendForm, amount: parseFloat(sendForm.amount) }),
      });
      const data = (await response.json()) as {
        error?: string | { fieldErrors?: Record<string, string[]> };
        draft?: SendDraft;
      };
      if (!response.ok) {
        if (typeof data.error === 'string') {
          setSendError(data.error);
        } else {
          const fieldErrors = data.error?.fieldErrors ?? {};
          setSendError(Object.values(fieldErrors).flat()[0] ?? 'Unable to process transaction.');
        }
        return;
      }
      setSendDraft(data.draft!);
      setAddressConfirmed(false);
      setSendStep('confirmation');
    } catch {
      setSendError('Unable to reach the server. Please try again.');
    } finally {
      setIsSendSubmitting(false);
    }
  }

  async function handleSendSubmit() {
    if (!sendDraft) return;
    setSendError('');
    setIsSendSubmitting(true);
    try {
      const response = await fetch(`/api/transactions/${sendDraft.id}/submit`, { method: 'POST' });
      const data = (await response.json()) as { error?: string; result?: SendResult };
      if (!response.ok) {
        setSendError(data.error ?? 'Unable to submit transaction.');
        return;
      }
      setSendResult(data.result!);
      setSendStep('result');
      router.refresh();
    } catch {
      setSendError('Unable to reach the server. Please try again.');
    } finally {
      setIsSendSubmitting(false);
    }
  }

  function handleSendReset() {
    setSendStep('input');
    setSendDraft(null);
    setSendResult(null);
    setSendError('');
    setAddressConfirmed(false);
    setSelectedContactId('');
    setSendForm((prev) => ({ ...prev, recipientAddress: '', amount: '', recipientSaved: false }));
  }

  // ── Buy helpers ─────────────────────────────────────────────────────────────
  function handleBuyWalletChange(walletId: string) {
    const selected = wallets.find((w) => w.id === walletId);
    setBuyForm((prev) => ({
      ...prev,
      walletId,
      network: selected?.network ?? prev.network,
    }));
  }

  const usdVal = parseFloat(buyForm.usdAmount);
  const coinPreview = !isNaN(usdVal) && usdVal > 0 && price > 0 ? usdVal / price : null;

  async function handleBuyInitiate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBuyError('');
    if (isNaN(usdVal) || usdVal < 1) {
      setBuyError('Minimum purchase is $1.00.');
      return;
    }
    setIsBuySubmitting(true);
    try {
      const response = await fetch('/api/transactions/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId: buyForm.walletId,
          assetSymbol: coin.symbol,
          coinAmount: usdVal / price,
          usdAmount: usdVal,
          priceAtPurchase: price,
          network: buyForm.network,
        }),
      });
      const data = (await response.json()) as { error?: string | object; draft?: BuyDraft };
      if (!response.ok) {
        setBuyError(typeof data.error === 'string' ? data.error : 'Unable to process purchase.');
        return;
      }
      setBuyDraft(data.draft!);
      setBuyStep('confirmation');
    } catch {
      setBuyError('Unable to reach the server. Please try again.');
    } finally {
      setIsBuySubmitting(false);
    }
  }

  async function handleBuySubmit() {
    if (!buyDraft) return;
    setBuyError('');
    setIsBuySubmitting(true);
    try {
      const response = await fetch(`/api/transactions/${buyDraft.id}/buy-submit`, { method: 'POST' });
      const data = (await response.json()) as { error?: string; result?: BuyResult };
      if (!response.ok) {
        setBuyError(data.error ?? 'Unable to complete purchase.');
        return;
      }
      setBuyResult(data.result!);
      setBuyStep('result');
      router.refresh();
    } catch {
      setBuyError('Unable to reach the server. Please try again.');
    } finally {
      setIsBuySubmitting(false);
    }
  }

  function handleBuyReset() {
    setBuyStep('input');
    setBuyDraft(null);
    setBuyResult(null);
    setBuyError('');
    setBuyForm((prev) => ({ ...prev, usdAmount: '' }));
  }

  // ── Holdings ────────────────────────────────────────────────────────────────
  const holdings = coinIsSupported
    ? wallets
        .map((w) => ({
          walletName: w.name,
          network: w.network,
          balance: w.balances[coin.symbol as SupportedAsset] ?? 0,
        }))
        .filter((h) => h.balance > 0)
    : [];

  const totalHeld = holdings.reduce((s, h) => s + h.balance, 0);
  const isPositive = change24h >= 0;

  // ── Breadcrumb helper ────────────────────────────────────────────────────────
  function Breadcrumb({ current }: { current: Step }) {
    const steps: Step[] = ['input', 'confirmation', 'result'];
    const labels = ['Details', 'Confirm', 'Done'];
    return (
      <div className="flex items-center gap-2 text-sm">
        {steps.map((s, i) => (
          <>
            {i > 0 && <span key={`sep-${i}`} className="text-slate-500">→</span>}
            <span
              key={s}
              className={`rounded-full px-3 py-1 ${
                current === s
                  ? 'bg-emerald-500/20 font-semibold text-emerald-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {labels[i]}
            </span>
          </>
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-6">

      <Link
        href="/search"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </Link>

      {/* ── Coin header ─────────────────────────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-800 text-lg font-bold text-emerald-300">
              {coin.symbol.slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{coin.name}</h1>
              <p className="text-sm text-slate-400">{coin.symbol} · {coin.category}</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="font-mono text-3xl font-bold">{formatPrice(price)}</p>
            <div className={`mt-1 flex items-center gap-1 font-mono text-sm sm:justify-end ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {isPositive ? '+' : ''}{change24h.toFixed(2)}% today
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-800 pt-5 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Market Cap</p>
            <p className="mt-1 font-mono text-sm font-medium">{formatLargeNumber(marketCap)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">24h Volume</p>
            <p className="mt-1 font-mono text-sm font-medium">{formatLargeNumber(volume24h)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Category</p>
            <p className="mt-1 text-sm font-medium text-slate-300">{coin.category}</p>
          </div>
        </div>
      </div>

      {/* ── Your Holdings ────────────────────────────────────────────────────── */}
      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Your Holdings
          </h2>
        </div>
        {!coinIsSupported || holdings.length === 0 ? (
          <p className="text-sm text-slate-500">
            You don&apos;t own any {coin.name} ({coin.symbol}).
          </p>
        ) : (
          <div className="divide-y divide-slate-800">
            {holdings.map((h, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-white">{h.walletName}</p>
                  <p className="text-xs text-slate-500">{h.network}</p>
                </div>
                <p className="font-mono text-sm font-semibold text-white">
                  {h.balance.toFixed(4)} {coin.symbol}
                </p>
              </div>
            ))}
            {holdings.length > 1 && (
              <div className="flex items-center justify-between pt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total</p>
                <p className="font-mono text-sm font-bold text-emerald-300">
                  {totalHeld.toFixed(4)} {coin.symbol}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Mode tabs ───────────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('buy')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            mode === 'buy'
              ? 'bg-emerald-500 text-slate-950'
              : 'border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          Buy
        </button>
        <button
          type="button"
          onClick={() => setMode('send')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            mode === 'send'
              ? 'bg-emerald-500 text-slate-950'
              : 'border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
          }`}
        >
          <ArrowUpRight className="h-4 w-4" />
          Send
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          BUY FLOW
      ════════════════════════════════════════════════════════════════════════ */}
      {mode === 'buy' && (
        <>
          <Breadcrumb current={buyStep} />

          {/* Buy — input step */}
          {buyStep === 'input' && (
            <div className="card p-6">
              <h2 className="mb-5 text-xl font-semibold">Buy {coin.name}</h2>

              {wallets.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400">You need a wallet before you can buy crypto.</p>
                  <Link
                    href="/wallets"
                    className="inline-flex rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                  >
                    Create a wallet
                  </Link>
                </div>
              ) : (
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleBuyInitiate}>

                  <label className="grid gap-2 md:col-span-2">
                    <span className="text-sm text-slate-300">Receive into wallet</span>
                    <select
                      className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                      value={buyForm.walletId}
                      onChange={(e) => handleBuyWalletChange(e.target.value)}
                      required
                    >
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>{w.name} — {w.network}</option>
                      ))}
                    </select>
                  </label>

                  <div className="grid gap-2">
                    <span className="text-sm text-slate-300">Network</span>
                    <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-white">
                      {buyForm.network}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <span className="text-sm text-slate-300">Asset</span>
                    <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-white">
                      {coin.symbol}
                    </div>
                  </div>

                  <label className="grid gap-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Amount (USD)</span>
                      <span className="text-xs text-slate-500">Min $1.00</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                      placeholder="100.00"
                      value={buyForm.usdAmount}
                      onChange={(e) => setBuyForm((prev) => ({ ...prev, usdAmount: e.target.value }))}
                      required
                    />
                    <div className="flex flex-wrap gap-2">
                      {[10, 50, 100, 500].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setBuyForm((prev) => ({ ...prev, usdAmount: String(v) }))}
                          className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
                        >
                          ${v}
                        </button>
                      ))}
                    </div>
                  </label>

                  {coinPreview !== null && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 md:col-span-2">
                      <p className="text-xs text-slate-400">You will receive approximately</p>
                      <p className="mt-1 font-mono text-xl font-bold text-emerald-300">
                        {coinPreview < 0.000001
                          ? coinPreview.toExponential(4)
                          : coinPreview.toFixed(6).replace(/\.?0+$/, '')} {coin.symbol}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        At {formatPrice(price)} per {coin.symbol} · Exchange fee {formatCurrency(EXCHANGE_FEE_USD)}
                      </p>
                    </div>
                  )}

                  {buyError && <p className="text-sm text-rose-400 md:col-span-2">{buyError}</p>}

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={isBuySubmitting}
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isBuySubmitting ? 'Processing...' : 'Review purchase'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Buy — confirmation step */}
          {buyStep === 'confirmation' && buyDraft && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold">Confirm purchase</h2>
              <p className="mt-1 text-sm text-slate-400">Review the details below before confirming.</p>

              <dl className="mt-6 grid gap-3 text-sm">
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <dt className="text-slate-400">You receive</dt>
                  <dd className="font-semibold text-emerald-300">
                    {buyDraft.coinAmount < 0.000001
                      ? buyDraft.coinAmount.toExponential(4)
                      : buyDraft.coinAmount.toFixed(6).replace(/\.?0+$/, '')} {buyDraft.assetSymbol}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <dt className="text-slate-400">Price locked at</dt>
                  <dd className="font-mono">{formatPrice(buyDraft.priceAtPurchase)}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <dt className="text-slate-400">Network</dt>
                  <dd>{buyDraft.network}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <dt className="text-slate-400">Destination wallet</dt>
                  <dd>{buyDraft.walletName}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <dt className="text-slate-400">Subtotal</dt>
                  <dd>{formatCurrency(buyDraft.usdAmount)}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <dt className="text-slate-400">Exchange fee</dt>
                  <dd>{formatCurrency(buyDraft.fee)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-slate-400">Total</dt>
                  <dd className="font-semibold">{formatCurrency(buyDraft.usdAmount + buyDraft.fee)}</dd>
                </div>
              </dl>

              {buyError && <p className="mt-4 text-sm text-rose-400">{buyError}</p>}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setBuyStep('input'); setBuyError(''); }}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleBuySubmit}
                  disabled={isBuySubmitting}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isBuySubmitting ? 'Buying...' : 'Confirm & Buy'}
                </button>
              </div>
            </div>
          )}

          {/* Buy — result step */}
          {buyStep === 'result' && buyResult && (
            <div className="card p-6">
              <p className="text-lg font-semibold text-emerald-400">Purchase complete!</p>
              <p className="mt-1 text-sm text-slate-400">
                The coins have been added to your wallet.
              </p>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <dt className="text-slate-400">Bought</dt>
                  <dd className="font-semibold text-emerald-300">
                    {buyResult.coinAmount < 0.000001
                      ? buyResult.coinAmount.toExponential(4)
                      : buyResult.coinAmount.toFixed(6).replace(/\.?0+$/, '')} {buyResult.assetSymbol}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <dt className="text-slate-400">Network</dt>
                  <dd>{buyResult.network}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Transaction hash</dt>
                  <dd className="font-mono text-xs">
                    {buyResult.txHash
                      ? `${buyResult.txHash.slice(0, 10)}...${buyResult.txHash.slice(-8)}`
                      : '—'}
                  </dd>
                </div>
              </dl>
              <span className="badge mt-4 inline-block">{buyResult.status}</span>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleBuyReset}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  Buy more
                </button>
                <Link
                  href="/transactions"
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  View history
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SEND FLOW
      ════════════════════════════════════════════════════════════════════════ */}
      {mode === 'send' && (
        <>
          <Breadcrumb current={sendStep} />

          {/* Send — input step */}
          {sendStep === 'input' && (
            <div className="card p-6">
              <h2 className="mb-5 text-xl font-semibold">Send crypto</h2>

              {wallets.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400">You need a wallet before you can send crypto.</p>
                  <Link
                    href="/wallets"
                    className="inline-flex rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                  >
                    Create a wallet
                  </Link>
                </div>
              ) : (
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSendInitiate}>

                  <label className="grid gap-2 md:col-span-2">
                    <span className="text-sm text-slate-300">From wallet</span>
                    <select
                      className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                      value={sendForm.walletId}
                      onChange={(e) => handleWalletChange(e.target.value)}
                      required
                    >
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>{w.name} — {w.network}</option>
                      ))}
                    </select>
                  </label>

                  {contacts.length > 0 && (
                    <label className="grid gap-2 md:col-span-2">
                      <span className="text-sm text-slate-300">
                        Select from contacts <span className="text-slate-500">(optional)</span>
                      </span>
                      <select
                        className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                        value={selectedContactId}
                        onChange={(e) => handleContactSelect(e.target.value)}
                      >
                        <option value="">— Type an address manually —</option>
                        {contacts.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} — {shortenAddress(c.address)}</option>
                        ))}
                      </select>
                    </label>
                  )}

                  <label className="grid gap-2 md:col-span-2">
                    <span className="text-sm text-slate-300">Recipient address</span>
                    <input
                      className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm"
                      placeholder="0x..."
                      value={sendForm.recipientAddress}
                      onChange={(e) => {
                        setSelectedContactId('');
                        setSendForm((prev) => ({
                          ...prev,
                          recipientAddress: e.target.value,
                          recipientSaved: false,
                        }));
                      }}
                      required
                    />
                    <p className="text-xs text-slate-500">
                      Make sure this address is correct. Transactions cannot be reversed.
                    </p>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm text-slate-300">Network</span>
                    <select
                      className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                      value={sendForm.network}
                      onChange={(e) =>
                        setSendForm((prev) => ({ ...prev, network: e.target.value as SupportedNetwork }))
                      }
                    >
                      <option>Ethereum Sepolia</option>
                      <option>Polygon Amoy</option>
                      <option>Base Sepolia</option>
                    </select>
                  </label>

                  <div className="grid gap-2">
                    <span className="text-sm text-slate-300">Asset</span>
                    <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-white">
                      {sendForm.assetSymbol}
                    </div>
                  </div>

                  <label className="grid gap-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Amount</span>
                      <span className="text-xs text-slate-500">
                        Available: {getSelectedWalletAssetBalance().toFixed(4)} {sendForm.assetSymbol}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
                      placeholder="0.10"
                      value={sendForm.amount}
                      onChange={(e) => setSendForm((prev) => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                    <div className="flex flex-wrap gap-2">
                      {[0.1, 0.5, 1.0].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setQuickAmount(v)}
                          className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
                        >
                          {v.toFixed(1)}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={setMaxAmount}
                        className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300"
                      >
                        Max
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Max leaves room for estimated network fees where applicable.
                    </p>
                  </label>

                  {sendError && <p className="text-sm text-rose-400 md:col-span-2">{sendError}</p>}

                  <div className="flex items-center justify-between md:col-span-2">
                    <button
                      type="submit"
                      disabled={isSendSubmitting}
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSendSubmitting ? 'Validating...' : 'Review transaction'}
                    </button>
                    <Link href="/contacts" className="text-xs text-slate-500 transition hover:text-slate-300">
                      Manage address book →
                    </Link>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Send — confirmation step */}
          {sendStep === 'confirmation' && sendDraft && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold">Confirm transaction</h2>
              <p className="mt-1 text-sm text-slate-400">Review the details below before signing.</p>

              <dl className="mt-6 grid gap-3 text-sm">
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <dt className="text-slate-400">From</dt>
                  <dd className="font-mono">{sendDraft.senderAddress ? shortenAddress(sendDraft.senderAddress) : '—'}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <dt className="text-slate-400">To</dt>
                  <dd className="font-mono">{shortenAddress(sendDraft.recipientAddress)}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <dt className="text-slate-400">Network</dt>
                  <dd>{sendDraft.network}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <dt className="text-slate-400">Amount</dt>
                  <dd className="font-semibold">{sendDraft.amount} {sendDraft.assetSymbol}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <dt className="text-slate-400">Estimated fee</dt>
                  <dd>{formatCurrency(sendDraft.estimatedFee)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Total cost</dt>
                  <dd className="font-semibold">
                    {sendDraft.amount} {sendDraft.assetSymbol} + {formatCurrency(sendDraft.estimatedFee)}
                  </dd>
                </div>
              </dl>

              {sendDraft.warnings.length > 0 && (
                <div className="mt-5 space-y-2">
                  {sendDraft.warnings.map((w, i) => (
                    <div key={i} className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
                      <p className="text-sm text-amber-200">⚠ {w}</p>
                    </div>
                  ))}
                  <label className="mt-3 flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-emerald-500"
                      checked={addressConfirmed}
                      onChange={(e) => setAddressConfirmed(e.target.checked)}
                    />
                    <span className="text-sm text-slate-300">
                      I have double-checked the recipient address and confirm it is correct.
                    </span>
                  </label>
                </div>
              )}

              {sendError && <p className="mt-4 text-sm text-rose-400">{sendError}</p>}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setSendStep('input'); setSendError(''); }}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSendSubmit}
                  disabled={isSendSubmitting || (sendDraft.warnings.length > 0 && !addressConfirmed)}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSendSubmitting ? 'Sending...' : 'Confirm & Send'}
                </button>
              </div>
            </div>
          )}

          {/* Send — result step */}
          {sendStep === 'result' && sendResult && (
            <div className="card p-6">
              <p className="text-lg font-semibold text-emerald-400">Transaction submitted</p>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <dt className="text-slate-400">Amount</dt>
                  <dd className="font-semibold">{sendResult.amount} {sendResult.assetSymbol}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <dt className="text-slate-400">Network</dt>
                  <dd>{sendResult.network}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <dt className="text-slate-400">Recipient</dt>
                  <dd className="font-mono">
                    {sendResult.recipientAddress ? shortenAddress(sendResult.recipientAddress) : '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Transaction hash</dt>
                  <dd className="font-mono text-xs">
                    {sendResult.txHash
                      ? `${sendResult.txHash.slice(0, 10)}...${sendResult.txHash.slice(-8)}`
                      : '—'}
                  </dd>
                </div>
              </dl>
              <span className="badge mt-4 inline-block">{sendResult.status}</span>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleSendReset}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  Send another
                </button>
                <Link
                  href="/transactions"
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  View history
                </Link>
              </div>
            </div>
          )}
        </>
      )}

    </section>
  );
}

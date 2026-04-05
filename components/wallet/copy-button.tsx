'use client';

import { useState } from 'react';

type Props = {
  address: string;
};

export function CopyButton({ address }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
    >
      {copied ? 'Copied!' : 'Copy address'}
    </button>
  );
}

import { AssetBalance, TransactionRecord } from '@/types';

export const supportedNetworks = [
  { name: 'Ethereum Sepolia', chainId: '11155111', symbol: 'ETH' },
  { name: 'Polygon Amoy', chainId: '80002', symbol: 'MATIC' },
  { name: 'Base Sepolia', chainId: '84532', symbol: 'ETH' },
] as const;

export const assetBalances: AssetBalance[] = [
  { symbol: 'ETH', name: 'Ethereum', balance: 1.24, price: 2520.12, network: 'Ethereum Sepolia' },
  { symbol: 'MATIC', name: 'Polygon', balance: 240, price: 0.73, network: 'Polygon Amoy' },
  { symbol: 'USDC', name: 'USD Coin', balance: 640, price: 1, network: 'Base Sepolia' },
];

export const transactions: TransactionRecord[] = [
  {
    id: 'tx_001',
    type: 'send',
    assetSymbol: 'ETH',
    amount: 0.14,
    recipientAddress: '0x9Bf2A3b0e487C8Dc1A7c8319143454B2e04f11Af',
    network: 'Ethereum Sepolia',
    status: 'submitted',
    estimatedFee: 2.11,
    createdAt: new Date().toISOString(),
    riskWarning: 'Address not saved in address book. Extra confirmation advised.',
  },
  {
    id: 'tx_002',
    type: 'receive',
    assetSymbol: 'USDC',
    senderAddress: '0x6AF8B4CdA23f43a6B4976b5951aAbC9f7b1ac112',
    amount: 120,
    network: 'Base Sepolia',
    status: 'pending',
    estimatedFee: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
];

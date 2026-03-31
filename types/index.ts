export type SupportedNetwork = 'Ethereum Sepolia' | 'Polygon Amoy' | 'Base Sepolia';

export interface AssetBalance {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  network: SupportedNetwork;
}

export interface TransactionRecord {
  id: string;
  type: 'send' | 'receive';
  assetSymbol: string;
  amount: number;
  recipientAddress?: string;
  senderAddress?: string;
  network: SupportedNetwork;
  status: 'draft' | 'submitted' | 'failed' | 'cancelled' | 'pending';
  estimatedFee: number;
  createdAt: string;
  riskWarning?: string;
}

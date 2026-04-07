import type {EncryptedPayloadV1} from '@/lib/crypto/types';

export type EncryptedWalletBackupV1 = {
    version: 1;
    backupType: 'encrypted-wallet-backup';
    exportedAt: string;
    wallet: {
        id?: string;
        name: string;
        network: string;
        addresses: Array<{
            label: string;
            address: string;
            network: string;
        }>;
    };
    encryptedSecret: EncryptedPayloadV1;
};

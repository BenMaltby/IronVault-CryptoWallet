export type SupportedAlgorithm = 'aes-256-gcm';
export type SupportedKdf = 'scrypt';

export type EncryptedPayloadV1 = {
    version: 1;
    algorithm: SupportedAlgorithm;
    kdf: SupportedKdf;
    kdfParams: {
        N: number;
        r: number;
        p: number;
        keyLength: number;
    };
    keyVersion: string;
    salt: string;
    iv: string;
    authTag: string;
    ciphertext: string;
    createdAt: string;
};

export type SecretBundle =
    | {
    type: 'recovery-phrase';
    recoveryPhrase: string;
}
    | {
    type: 'imported-private-key';
    privateKey: string;
    addressHint?: string;
};

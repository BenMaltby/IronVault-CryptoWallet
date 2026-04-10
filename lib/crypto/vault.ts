import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
    scrypt as nodeScrypt,
} from 'node:crypto';
import {promisify} from 'node:util';

import {
    DecryptionFailedError,
    InvalidPayloadFormatError,
    UnsupportedCryptoVersionError,
} from '@/lib/crypto/errors';
import type {EncryptedPayloadV1, SecretBundle} from '@/lib/crypto/types';

const scrypt = promisify(nodeScrypt);

const SCRYPT_PARAMS = {
    N: 16384,
    r: 8,
    p: 1,
    keyLength: 32,
} as const;

function assertPayloadShape(payload: unknown): asserts payload is EncryptedPayloadV1 {
    if (!payload || typeof payload !== 'object') {
        throw new InvalidPayloadFormatError();
    }

    const candidate = payload as Record<string, unknown>;

    const requiredKeys = [
        'version',
        'algorithm',
        'kdf',
        'kdfParams',
        'keyVersion',
        'salt',
        'iv',
        'authTag',
        'ciphertext',
        'createdAt',
    ];

    for (const key of requiredKeys) {
        if (!(key in candidate)) {
            throw new InvalidPayloadFormatError(`Missing encrypted payload key: ${key}`);
        }
    }
}

async function deriveKey(passphrase: string, salt: Buffer, keyLength: number) {
    const derived = await new Promise<Buffer>((resolve, reject) => {
        nodeScrypt(
            passphrase,
            salt,
            keyLength,
            {
                N: SCRYPT_PARAMS.N,
                r: SCRYPT_PARAMS.r,
                p: SCRYPT_PARAMS.p,
            },
            (err, derivedKey) => {
                if (err) return reject(err);
                resolve(derivedKey as Buffer);
            },
        );
    });

    return Buffer.from(derived);
}

export async function encryptSecretBundle(
    passphrase: string,
    secretBundle: SecretBundle,
): Promise<EncryptedPayloadV1> {
    const salt = randomBytes(16);
    const iv = randomBytes(12);
    const key = await deriveKey(passphrase, salt, SCRYPT_PARAMS.keyLength);

    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const plaintext = Buffer.from(JSON.stringify(secretBundle), 'utf8');

    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
        version: 1,
        algorithm: 'aes-256-gcm',
        kdf: 'scrypt',
        kdfParams: {...SCRYPT_PARAMS},
        keyVersion: process.env.CRYPTO_KEY_VERSION ?? 'v1',
        salt: salt.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        ciphertext: encrypted.toString('base64'),
        createdAt: new Date().toISOString(),
    };
}

export async function decryptSecretBundle(
    passphrase: string,
    payload: unknown,
): Promise<SecretBundle> {
    assertPayloadShape(payload);

    if (payload.version !== 1) {
        throw new UnsupportedCryptoVersionError();
    }

    try {
        const salt = Buffer.from(payload.salt, 'base64');
        const iv = Buffer.from(payload.iv, 'base64');
        const authTag = Buffer.from(payload.authTag, 'base64');
        const ciphertext = Buffer.from(payload.ciphertext, 'base64');

        const key = await deriveKey(passphrase, salt, payload.kdfParams.keyLength);

        const decipher = createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([
            decipher.update(ciphertext),
            decipher.final(),
        ]).toString('utf8');

        const parsed = JSON.parse(decrypted) as SecretBundle;

        if (!parsed || typeof parsed !== 'object' || !('type' in parsed)) {
            throw new DecryptionFailedError('Decrypted secret bundle shape is invalid.');
        }

        return parsed;
    } catch {
        throw new DecryptionFailedError();
    }
}

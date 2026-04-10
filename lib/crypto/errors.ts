export class InvalidPayloadFormatError extends Error {
    constructor(message = 'Encrypted payload format is invalid.') {
        super(message);
        this.name = 'InvalidPayloadFormatError';
    }
}

export class UnsupportedCryptoVersionError extends Error {
    constructor(message = 'Unsupported crypto payload version.') {
        super(message);
        this.name = 'UnsupportedCryptoVersionError';
    }
}

export class DecryptionFailedError extends Error {
    constructor(message = 'Failed to decrypt encrypted payload.') {
        super(message);
        this.name = 'DecryptionFailedError';
    }
}

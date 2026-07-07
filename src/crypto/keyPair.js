const crypto = require('crypto');

function generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256k1',
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        },
    });

    return { publicKey, privateKey };
}

function signData(privateKey, payload) {
    const sign = crypto.createSign('sha256');
    sign.update(payload);
    sign.end();
    return sign.sign(privateKey, 'hex');
}

function verifySignature(publicKey, payload, signature) {
    const verify = crypto.createVerify('sha256');
    verify.update(payload);
    verify.end();
    return verify.verify(publicKey, signature, 'hex');
}

function publicKeyFingerprint(publicKey) {
    return crypto
        .createHash('sha256')
        .update(publicKey)
        .digest('hex')
        .slice(0, 16);
}

module.exports = {
    generateKeyPair,
    signData,
    verifySignature,
    publicKeyFingerprint,
};
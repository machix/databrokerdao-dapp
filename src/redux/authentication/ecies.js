const secp256k1 = require('secp256k1');
const ecurve = require('ecurve');
const BigInt = require('bigi');
const assert = require('assert');
const crypto = require('crypto');

/**
 * Specific error for wrong key formats
 * @class
 */
class KeysShouldBeInBufferFormat extends Error {}

/**
 * Encryption and decryption based on the elliptic curve integrated encryption scheme.
 * @class
 */
class ECIES {
  /**
   * Encrypts a data buffer using ECIES encryption.
   *
   * @param  {Buffer} myPrivateKey   the private key of the encrypting party
   * @param  {Buffer} theirPublicKey the pubic key of the decrypting party
   * @param  {Buffer} data           the data to be encrypted
   * @return {Buffer}                the encrypted data
   *
   * @throws {KeysShouldBeInBufferFormat}  The keys must be provided in Buffer format
   *
   * @public
   */
  encryptMessage(myPrivateKey, theirPublicKey, data) {
    if (!Buffer.isBuffer(myPrivateKey)) {
      throw new KeysShouldBeInBufferFormat(
        'The private key should be a Buffer'
      );
    }
    if (!Buffer.isBuffer(theirPublicKey)) {
      throw new KeysShouldBeInBufferFormat('The public key should be a Buffer');
    }
    theirPublicKey = this._checkPublicKey(theirPublicKey);
    const r = this._ecdh(myPrivateKey, theirPublicKey);
    const key = this._concatKDF(r, 32);
    const ekey = key.slice(0, 16);
    const mkeyMaterial = key.slice(16, 32);
    const ourPubKey = secp256k1.publicKeyConvert(
      secp256k1.publicKeyCreate(myPrivateKey),
      false
    );
    const IV = Buffer.alloc(16);
    IV.fill(0);
    const aes = crypto.createCipheriv('aes-128-ctr', ekey, IV);
    let encrypted = aes.update(data);
    encrypted = Buffer.concat([IV, encrypted]);
    const sha256 = crypto.createHash('sha256');
    sha256.update(mkeyMaterial);
    const mkey = sha256.digest();
    const hmac = crypto.createHmac('sha256', mkey);
    hmac.update(encrypted);
    const tag = hmac.digest();
    return Buffer.concat([ourPubKey, encrypted, tag]);
  }

  /**
   * Decrypts a data buffer using ECIES encryption.
   *
   * @param  {Buffer} myPrivateKey   the private key of the decrypting party
   * @param  {Buffer} data           the data to be decrypted
   * @return {Buffer}                the decrypted data
   *
   * @throws {KeysShouldBeInBufferFormat}  The keys must be provided in Buffer format
   *
   * @public
   */
  decryptMessage(myPrivateKey, data) {
    if (!Buffer.isBuffer(myPrivateKey)) {
      throw new KeysShouldBeInBufferFormat(
        'The private key should be a Buffer'
      );
    }
    const pubKey = data.slice(0, 65);
    const dataIV = data.slice(65, -32);
    const tag = data.slice(-32);
    const r = this._ecdh(myPrivateKey, pubKey);
    const key = this._concatKDF(r, 32);
    const ekey = key.slice(0, 16);
    const mkeyMaterial = key.slice(16, 32);
    const sha256 = crypto.createHash('sha256');
    sha256.update(mkeyMaterial);
    const mkey = sha256.digest();
    const hmac = crypto.createHmac('sha256', mkey);
    hmac.update(dataIV);
    assert(hmac.digest('hex') === tag.toString('hex'), 'should have valid tag');
    const IV = dataIV.slice(0, 16);
    const encryptedData = dataIV.slice(16);
    const aes = crypto.createDecipheriv('aes-128-ctr', ekey, IV);
    return aes.update(encryptedData);
  }

  _ecdh(privateKey, publicKey) {
    const d = BigInt.fromBuffer(privateKey);
    const Q = ecurve.Point.decodeFrom(this._getCurve(), publicKey);
    const r = Q.multiply(d).getEncoded(true);
    return r.slice(1);
  }

  _concatKDF(keyMaterial, keyLen) {
    const s1 = '';
    let key = '';
    const reps = ((keyLen + 7) * 8) / (64 * 8);
    let counter = 0;
    while (counter <= reps) {
      counter += 1;
      const sha256 = crypto.createHash('sha256');
      const cnt = Buffer.alloc(4);
      cnt.fill(0);
      cnt.writeUInt32BE(counter, 0);
      sha256.update(cnt);
      sha256.update(keyMaterial);
      sha256.update(s1);
      key += sha256.digest('hex');
    }
    return Buffer.from(key, 'hex');
  }

  _getCurve(curveName = 'secp256k1') {
    const curve = ecurve.getCurveByName(curveName);
    if (!curve) {
      throw new Error(
        `No ${curveName} curve found, tis means there was a problem installing the dependencies.`
      );
    }
    return curve;
  }

  _checkPublicKey(publicKey) {
    const byteLength = Math.floor((this._getCurve().p.bitLength() + 7) / 8);
    if (publicKey.length === byteLength) {
      // the key is compressed, without the required 03 in front
      return Buffer.concat([Buffer.from('03', 'hex'), publicKey]);
    }
    if (publicKey.length === byteLength * 2) {
      // the key is uncompressed, without the required 04 in front
      return Buffer.concat([Buffer.from('04', 'hex'), publicKey]);
    }
    return publicKey;
  }
}

module.exports = ECIES;

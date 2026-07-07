const { notImplemented } = require('../util/notImplemented');
const { hashObject } = require('../crypto/hash');
const { COINBASE_TX_ID } = require('../config');
const { signData, verifySignature } = require('../crypto/keyPair');

/** @see tests/unit/core/Transaction*.test.js */
class Transaction {
  constructor(inputs = [], outputs = [], timestamp = Date.now()) {
    this.inputs = inputs;
    this.outputs = outputs;
    this.timestamp = timestamp;
    this.signatures = {};
    this.id = this.calculateId();
  }

  static coinbase(recipientAddress, amount, timestamp = Date.now()) {
    const tx = new Transaction(
        [
          {
            txId: COINBASE_TX_ID,
            outputIndex: -1,
            signature: null,
          },
        ],
        [
          {
            address: recipientAddress,
            amount,
          },
        ],
        timestamp
    );

    tx.id = tx.calculateId();
    return tx;
  }

  static create(senderAddress, recipientAddress, amount, utxos, changeAddress) {
    let total = 0;

    for (const utxo of utxos) {
      total += utxo.amount;
    }

    if (total < amount) {
      throw new Error('Insufficient balance');
    }

    const outputs = [
      {
        address: recipientAddress,
        amount,
      },
    ];

    if (total > amount) {
      outputs.push({
        address: changeAddress,
        amount: total - amount,
      });
    }

    const inputs = utxos.map((utxo) => ({
      txId: utxo.txId,
      outputIndex: utxo.outputIndex,
      signature: null,
    }));

    const tx = new Transaction(inputs, outputs);
    tx.id = tx.calculateId();

    return tx;
  }

  calculateId() {
    return hashObject({
      inputs: this.inputs,
      outputs: this.outputs,
      timestamp: this.timestamp,
    });
  }

  getSigningPayload(inputIndex) {
    return JSON.stringify({
      inputs: this.inputs,
      outputs: this.outputs,
      timestamp: this.timestamp,
      inputIndex,
    });
  }

  sign(privateKey, publicKey) {

    if (this.isCoinbase()) {
      throw new Error('Cannot sign coinbase');
    }

    for (let i = 0; i < this.inputs.length; i++) {
      this.signatures[i] = signData(
          privateKey,
          this.getSigningPayload(i)
      );
    }

    this.signatures._publicKey = publicKey;
  }
  verify() {

    if (this.isCoinbase()) {
      return true;
    }

    const publicKey = this.signatures._publicKey;

    if (!publicKey) {
      return false;
    }

    for (let i = 0; i < this.inputs.length; i++) {

      const signature = this.signatures[i];

      if (!signature) {
        return false;
      }

      if (
          !verifySignature(
              publicKey,
              this.getSigningPayload(i),
              signature
          )
      ) {
        return false;
      }
    }

    return true;
  }

  isCoinbase() {
    return (
        this.inputs.length > 0 &&
        this.inputs[0].txId === COINBASE_TX_ID
    );
  }

  spendFromSnapshot(utxoSnapshot) {
    notImplemented('Transaction.spendFromSnapshot');
  }

  toJSON() {
    return {
      id: this.id,
      inputs: this.inputs,
      outputs: this.outputs,
      timestamp: this.timestamp,
      signatures: this.signatures,
    };
  }

  static fromJSON(data) {
    const tx = new Transaction(
        data.inputs,
        data.outputs,
        data.timestamp
    );

    tx.id = data.id;
    tx.signatures = data.signatures || {};

    return tx;
  }
}

module.exports = { Transaction };
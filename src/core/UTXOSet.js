const { notImplemented } = require('../util/notImplemented');

/** @see tests/unit/core/UTXOSet.test.js */
class UTXOSet {
  constructor() {
    this.utxos = new Map();
  }

  static key(txId, outputIndex) {
    return `${txId}:${outputIndex}`;
  }

  add(tx) {
    tx.outputs.forEach((output, index) => {
      const key = UTXOSet.key(tx.id, index);

      this.utxos.set(key, {
        txId: tx.id,
        outputIndex: index,
        address: output.address,
        amount: output.amount,
      });
    });
  }

  spend(tx) {
    for (const input of tx.inputs) {
      const key = UTXOSet.key(input.txId, input.outputIndex);
      this.utxos.delete(key);
    }
  }

  applyTransaction(tx) {
    // 1. spend inputs
    this.spend(tx);
    // 2. add outputs
    this.add(tx);
  }

  applyBlock(transactions) {
    for (const tx of transactions) {
      this.applyTransaction(tx);
    }
  }

  getBalance(address) {
    let total = 0;

    for (const utxo of this.utxos.values()) {
      if (utxo.address === address) {
        total += utxo.amount;
      }
    }

    return total;
  }

  getUnspentForAddress(address) {
    return Array.from(this.utxos.values()).filter(
        (u) => u.address === address
    );
  }

  has(txId, outputIndex) {
    return this.utxos.has(UTXOSet.key(txId, outputIndex));
  }

  clone() {
    const copy = new UTXOSet();
    copy.utxos = new Map(this.utxos);
    return copy;
  }

  toJSON() {
    return Array.from(this.utxos.entries());
  }

  static fromJSON(entries) {
    const set = new UTXOSet();
    set.utxos = new Map(entries);
    return set;
  }
}

module.exports = { UTXOSet };
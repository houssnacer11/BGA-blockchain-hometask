/** @see tests/unit/core/Mempool.test.js */
class Mempool {
  constructor() {
    this.transactions = new Map();
  }

  add(transaction) {
    if (transaction.isCoinbase()) {
      throw new Error("Coinbase");
    }

    if (!transaction.verify()) {
      throw new Error("Invalid transaction signature");
    }

    if (this.transactions.has(transaction.id)) {
      throw new Error("Transaction already in mempool");
    }

    this.transactions.set(transaction.id, transaction);
  }

  remove(transactionId) {
    this.transactions.delete(transactionId);
  }

  removeMany(ids) {
    ids.forEach(id => this.remove(id));
  }

  getPending(limit = 100) {
    return [...this.transactions.values()].slice(0, limit);
  }

  has(transactionId) {
    return this.transactions.has(transactionId);
  }

  clear() {
    this.transactions.clear();
  }

  size() {
    return this.transactions.size;
  }
}

module.exports = { Mempool };
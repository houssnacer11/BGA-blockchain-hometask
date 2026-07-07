const { sha256, hashObject, meetsDifficulty } = require('../crypto/hash');
const { MerkleTree } = require('./MerkleTree');
const { Transaction } = require('./Transaction');


/** @see tests/unit/core/Block*.test.js */
class Block {
  constructor(
      index,
      timestamp,
      transactions,
      previousHash,
      nonce = 0,
      difficulty = 2,
      hash = null
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.difficulty = difficulty;
    this.merkleRoot = this.computeMerkleRoot();
    this.hash = hash || this.calculateHash();
  }


  computeMerkleRoot() {
    const leaves = this.transactions.map(tx => tx.id);

    const tree = new MerkleTree(leaves);

    return tree.root;
  }


  calculateHash() {

    return hashObject({
      index: this.index,
      timestamp: this.timestamp,
      transactions: this.transactions.map(tx => tx.id),
      previousHash: this.previousHash,
      nonce: this.nonce,
      difficulty: this.difficulty,
      merkleRoot: this.merkleRoot
    });

  }


  mine() {

    this.merkleRoot = this.computeMerkleRoot();

    do {

      this.hash = this.calculateHash();

      if (meetsDifficulty(this.hash, this.difficulty)) {
        return this.hash;
      }

      this.nonce++;

    } while(true);

  }


  isValid(previousBlock) {

    if(this.computeMerkleRoot() !== this.merkleRoot){
      return false;
    }


    if(this.calculateHash() !== this.hash){
      return false;
    }


    if(!meetsDifficulty(this.hash,this.difficulty)){
      return false;
    }


    if(previousBlock){

      if(this.previousHash !== previousBlock.hash){
        return false;
      }

      if(this.index !== previousBlock.index + 1){
        return false;
      }

    }


    return true;
  }


  toJSON(){

    return {
      index:this.index,
      timestamp:this.timestamp,
      transactions:this.transactions.map(tx=>tx.toJSON()),
      previousHash:this.previousHash,
      nonce:this.nonce,
      difficulty:this.difficulty,
      merkleRoot:this.merkleRoot,
      hash:this.hash
    };

  }


  static fromJSON(data){

    return new Block(
        data.index,
        data.timestamp,
        data.transactions.map(tx=>Transaction.fromJSON(tx)),
        data.previousHash,
        data.nonce,
        data.difficulty,
        data.hash
    );

  }
}


function createGenesisBlock(coinbaseTx, difficulty = 2){

  return new Block(
      0,
      Date.now(),
      [coinbaseTx],
      "0",
      0,
      difficulty
  );

}


module.exports = { Block, createGenesisBlock };
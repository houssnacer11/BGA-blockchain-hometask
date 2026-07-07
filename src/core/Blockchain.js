const { Block, createGenesisBlock } = require('./Block');
const { Transaction } = require('./Transaction');
const { UTXOSet } = require('./UTXOSet');
const { Mempool } = require('./Mempool');
const { MINING_REWARD, DIFFICULTY_ADJUSTMENT_INTERVAL } = require('../config');


class Blockchain {

  constructor(minerAddress, difficulty = 2) {

    this.difficulty = difficulty;

    this.mempool = new Mempool();

    this.utxoSet = new UTXOSet();

    this.chain = [
      this.createGenesisBlock(minerAddress)
    ];

    this.utxoSet.applyBlock(
        this.chain[0].transactions
    );
  }


  createGenesisBlock(minerAddress){

    const coinbase = Transaction.coinbase(
        minerAddress,
        MINING_REWARD
    );

    return createGenesisBlock(
        coinbase,
        this.difficulty
    );

  }


  getLatestBlock(){

    return this.chain[this.chain.length - 1];

  }


  getDifficultyForNextBlock(){

    if(
        this.chain.length <= DIFFICULTY_ADJUSTMENT_INTERVAL
    ){
      return this.difficulty;
    }


    const blocks = this.chain.slice(
        -DIFFICULTY_ADJUSTMENT_INTERVAL
    );


    const first = blocks[0];
    const last = blocks[blocks.length -1];


    const actualTime =
        last.timestamp - first.timestamp;


    const expectedTime =
        DIFFICULTY_ADJUSTMENT_INTERVAL * 1000;


    let difficulty = this.difficulty;


    if(actualTime < expectedTime / 2){
      difficulty++;
    }


    if(actualTime > expectedTime * 2){
      difficulty = Math.max(1, difficulty - 1);
    }


    return difficulty;

  }



  validateTransactionInContext(tx, snapshot = this.utxoSet) {

    let inputAmount = 0;

    for (const input of tx.inputs) {

      const utxo = snapshot.utxos.get(
          UTXOSet.key(input.txId, input.outputIndex)
      );

      if (!utxo) {
        return {
          valid: false,
          reason: "Referenced UTXO not found"
        };
      }

      inputAmount += utxo.amount;
    }

    const outputAmount = tx.outputs.reduce(
        (sum, o) => sum + o.amount,
        0
    );

    if (outputAmount > inputAmount) {
      return {
        valid: false,
        reason: "Outputs exceed inputs"
      };
    }

    if (!tx.verify()) {
      return {
        valid: false,
        reason: "Invalid transaction signature"
      };
    }

    return { valid: true };
  }

  getUtxoSnapshotIncludingMempool(excludeTxId=null){

    const snapshot =
        this.utxoSet.clone();


    for(const tx of this.mempool.getPending()){

      if(tx.id !== excludeTxId){

        snapshot.applyTransaction(tx);

      }

    }


    return snapshot;

  }



  addTransaction(transaction){


    const snapshot =
        this.getUtxoSnapshotIncludingMempool();


    const result =
        this.validateTransactionInContext(
            transaction,
            snapshot
        );


    if(!result.valid){

      throw new Error(result.reason);

    }


    this.mempool.add(transaction);

  }




  minePendingTransactions(minerAddress){


    const transactions =
        this.mempool.getPending();


    const coinbase =
        Transaction.coinbase(
            minerAddress,
            MINING_REWARD
        );


    transactions.unshift(coinbase);



    const block = new Block(

        this.chain.length,

        Date.now(),

        transactions,

        this.getLatestBlock().hash,

        0,

        this.getDifficultyForNextBlock()

    );


    block.mine();


    this.chain.push(block);


    this.utxoSet.applyBlock(
        transactions
    );


    this.mempool.clear();


    return block;

  }



  isChainValid(){


    for(let i=1;i<this.chain.length;i++){

      if(
          !this.chain[i].isValid(
              this.chain[i-1]
          )
      ){
        return false;
      }

    }


    return true;

  }



  getBalance(address){

    return this.utxoSet.getBalance(address);

  }



  replaceChain(newChain){

    if(newChain.length <= this.chain.length){
      return false;
    }


    for(let i=1;i<newChain.length;i++){

      if(
          !newChain[i].isValid(newChain[i-1])
      ){
        return false;
      }

    }


    this.chain = newChain;

    this.utxoSet = new UTXOSet();


    for(const block of this.chain){

      this.utxoSet.applyBlock(
          block.transactions
      );

    }


    return true;

  }



  toJSON(){

    return {
      difficulty:this.difficulty,
      chain:this.chain.map(b=>b.toJSON()),
      utxoSet:this.utxoSet.toJSON()
    };

  }



  static fromJSON(data, minerAddress){

    const bc =
        new Blockchain(
            minerAddress,
            data.difficulty
        );


    bc.chain =
        data.chain.map(
            b=>Block.fromJSON(b)
        );


    bc.utxoSet =
        UTXOSet.fromJSON(
            data.utxoSet
        );


    return bc;

  }

}


module.exports = { Blockchain };
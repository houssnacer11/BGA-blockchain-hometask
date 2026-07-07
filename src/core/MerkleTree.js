const crypto = require('crypto');

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

class MerkleTree {
  constructor(leaves = []) {
    this.leaves = leaves;

    if (!leaves || leaves.length === 0) {
      this.root = null;
      return;
    }

    this.root = this.buildTree(leaves);
  }

  buildTree(leaves) {
    let level = leaves.map(x => sha256(x));

    while (level.length > 1) {
      if (level.length % 2 === 1) {
        level.push(level[level.length - 1]); // duplicate last
      }

      const nextLevel = [];

      for (let i = 0; i < level.length; i += 2) {
        const combined = sha256(level[i] + level[i + 1]);
        nextLevel.push(combined);
      }

      level = nextLevel;
    }

    return level[0];
  }

  getProof(index) {
    if (index < 0 || index >= this.leaves.length) {
      return null;
    }

    let level = this.leaves.map(x => sha256(x));
    let idx = index;

    const proof = [];

    while (level.length > 1) {
      if (level.length % 2 === 1) {
        level.push(level[level.length - 1]);
      }

      const isRightNode = idx % 2 === 1;
      const siblingIndex = isRightNode ? idx - 1 : idx + 1;

      proof.push({
        sibling: level[siblingIndex],
        isRightNode
      });

      const nextLevel = [];

      for (let i = 0; i < level.length; i += 2) {
        nextLevel.push(sha256(level[i] + level[i + 1]));
      }

      idx = Math.floor(idx / 2);
      level = nextLevel;
    }

    return proof;
  }

  static verify(leaf, proof, root) {
    let hash = sha256(leaf);

    for (const step of proof) {
      if (step.isRightNode) {
        hash = sha256(step.sibling + hash);
      } else {
        hash = sha256(hash + step.sibling);
      }
    }

    return hash === root;
  }
}

module.exports = { MerkleTree };
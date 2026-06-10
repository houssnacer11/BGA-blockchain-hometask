# Blockchain Home Task — Advanced (Node.js)

**Coding assessment:** implement a blockchain in `src/`. **Tests define the requirements** — your submission is complete when `npm test` passes (89 tests).

## What you must implement (coding)

Implement files under `src/` (stubs throw `Not implemented`). The test suite is your spec.

| Area | Files | Advanced topics |
|------|-------|-----------------|
| Crypto | `src/crypto/hash.js`, `keyPair.js` | SHA-256, ECDSA secp256k1, sign/verify |
| Core | `src/core/*.js` | Blocks, PoW, Merkle root, UTXO, mempool, wallet |
| Chain | `src/core/Blockchain.js` | Genesis, mining, validation, difficulty retargeting, chain replace |
| Network | `src/network/P2PServer.js` | WebSocket sync (longest valid chain) |
| Storage | `src/storage/persistence.js` | Save/load chain JSON |

**Already wired for you** (focus on blockchain logic, not HTTP boilerplate):

- `src/config.js` — constants  
- `src/api/server.js` — REST endpoints  
- `src/index.js` — starts API + P2P  

## Pass criteria

```bash
npm install
npm test    # all 89 tests green
npm start   # API on :3001, P2P on :6001
```

## Suggested order

1. `crypto/hash` → `crypto/keyPair`  
2. `MerkleTree` → `Transaction` → `UTXOSet`  
3. `Block` → `Mempool` → `Wallet` → `Blockchain`  
4. `persistence` → `P2PServer`  
5. Run full suite: `npm test`

Run one group at a time, e.g. `npm test -- tests/unit/crypto`.

## Architecture (add to your submission)

After implementation, add a short **Architecture** section below (or in a comment at the top of this file) describing:

- How a transaction moves: wallet → mempool → block → UTXO set  
- How PoW and difficulty adjustment work  
- How P2P chooses the canonical chain  

This is documentation of **your** code, not a substitute for implementation.

---

## Role-specific evaluation & test mapping

Below is a concise analysis of each hiring role and how to evaluate candidates using this repository. For each role I list the most relevant parts of the codebase, the test suites that exercise those areas, suggested additional small tasks to include in interviews/homework, and concrete acceptance criteria you can use when grading submissions.

Senior Blockchain Engineer (Remote)
- Focus areas: `src/core/*`, `src/crypto/*`, `src/network/P2PServer.js`, `src/storage/persistence.js`
- Tests that matter: `tests/unit/core/*`, `tests/unit/crypto/*`, `tests/integration/*` (blockchainFlow, chainReorg, genesis, multiWallet, serialization)
- Suggested evaluation tasks: design a short architecture doc (consensus, difficulty retargeting), fix or add a deterministic performance benchmark for mining, review and harden validation logic (edge cases).
- Acceptance: passes core + integration suites; clear architecture notes; at least one safe improvement suggested and demonstrated in code or tests.

Senior Smart Contract Engineer (Remote)
- Focus areas: cryptography, transaction model, signature and verification (`src/crypto`, `src/core/Transaction.js`, `src/core/UTXOSet.js`, `src/core/Wallet.js`).
- Tests that matter: `tests/unit/crypto/*`, `tests/unit/core/Transaction*.js`, `tests/unit/core/UTXOSet.test.js`, `tests/unit/core/Wallet.test.js`.
- Suggested evaluation tasks: specify how same transaction semantics would map to on-chain contracts; propose attack scenarios and mitigations (reentrancy-like analogues, double-spend).
- Acceptance: passes crypto+transaction related unit tests and provides a short technical note mapping off-chain transaction/UTXO design to a hypothetical Solidity contract design.

Senior Web3 Full Stack Engineer (Remote)
- Focus areas: API integration, wallet flow, UX-friendly endpoints (`src/api/server.js`), P2P integration for real-time updates.
- Tests that matter: `tests/api/*`, `tests/network/p2p.test.js`, relevant integration tests.
- Suggested evaluation tasks: implement a small client script (curl or Node) that uses the API to create a wallet, submit a transaction, and mine a block; optionally add a tiny React/Next demo.
- Acceptance: API tests pass and a short end-to-end demo script demonstrates the full flow: wallet -> transaction -> mine -> balance.

Senior Backend Engineer (Remote)
- Focus areas: persistence, indexing, event-driven processing (`src/storage/persistence.js`, chain serialization), scalable architecture notes.
- Tests that matter: `tests/storage/persistence.test.js`, integration tests, and `tests/api/*` for endpoints that rely on persistence.
- Suggested evaluation tasks: add a basic indexer script that builds address-to-UTXO lookup and provide a small benchmark for load/save operations.
- Acceptance: persistence tests pass, indexer proof-of-concept included, and brief notes on scalability and trade-offs.

Senior Frontend Engineer (Remote)
- Focus areas: API ergonomics and UX (though this repo is backend-focused). Evaluate how well the API supports frontend flows and error handling.
- Tests that matter: `tests/api/*` (endpoint correctness), integration tests that exercise API workflows.
- Suggested evaluation tasks: create a small example (static page or script) showing wallet creation and transaction flow and document developer-friendly improvements to API payloads/responses.
- Acceptance: API tests pass and a short frontend demo or curl script demonstrates the expected UX flow.

Senior DevOps Engineer (Remote)
- Focus areas: reproducible builds, CI, containerization, observability and deployment. This repo currently contains the app and tests but no CI or Dockerfiles.
- Tests that matter: entire test suite (CI should run `npm install && npm test`) and any start scripts (`npm start`).
- Suggested evaluation tasks: provide a simple `Dockerfile`, a `docker-compose.yml` for local dev (API + P2P), and a minimal GitHub Actions workflow that runs tests and lints on PRs.
- Acceptance: tests run successfully inside the provided Dockerfile / CI job; candidate documents runbook for deployment and node operation.

How to use the test mapping during hiring
- Baseline: run the full test suite locally with `npm install && npm test`. Tests are the authoritative spec for this assignment.
- Role-specific grading: run only the relevant tests listed above for faster iteration (e.g. `npm test -- tests/unit/crypto`), then review the suggested additional tasks and supporting docs/demos.
- Timebox: for take-home assignments, ask candidates to complete core tests + one role-specific task within 48–72 hours. For on-site exercises, use a focused subset of tests and a 2–4 hour coding task.

Scoring rubric (suggested)
- Correctness (60%): how many relevant tests pass, correctness of edge-case handling.
- Code quality (20%): readability, structure, comments, and sensible abstractions.
- Design and reasoning (15%): architecture notes, security considerations, trade-offs.
- Delivery (5%): submission completeness, documentation, small demos or scripts.

Add this to your submission
- Candidates should add a short `ARCHITECTURE.md` or a top-of-readme section describing key design choices relevant to their role (2–4 paragraphs), and include any extra scripts or docs in a `candidate/` folder.


## To-do list (check off as you complete)

### 1. Project setup

- [x] Node.js project with `package.json` (provided)
- [x] CommonJS (`require`), scripts, `.gitignore` (provided)
- [ ] You can run `npm install`, `npm test`, `npm start` locally

### 2. Cryptography

- [ ] SHA-256 hashing for blocks and data
- [ ] ECDSA key pair generation (secp256k1)
- [ ] Sign transaction payloads
- [ ] Verify signatures before accepting transactions
- [ ] Wallet address derived from public key

### 3. Block & chain

- [ ] `Block`: index, timestamp, transactions, previous hash, nonce, hash, difficulty
- [ ] Merkle root of transaction IDs per block
- [ ] Proof of Work (mine until hash meets difficulty)
- [ ] Genesis block (index 0, previous hash `"0"`)
- [ ] `Blockchain`: append blocks, get latest block
- [ ] Validate block links and PoW
- [ ] Validate full chain (`isChainValid`)

### 4. Transactions & UTXO

- [ ] `Transaction`: inputs, outputs, id, timestamp
- [ ] Coinbase transaction (mining reward)
- [ ] Create transfer transactions (recipient, amount, change)
- [ ] UTXO set: track unspent outputs
- [ ] Spend UTXOs when transaction is confirmed
- [ ] Balance per address from UTXOs
- [ ] Reject spending non-existent or already-spent UTXOs
- [ ] Mempool for pending transactions
- [ ] Prevent double-spend in mempool (same UTXO twice)

### 5. Mining

- [ ] Collect mempool transactions + coinbase reward
- [ ] Mine block with configurable difficulty
- [ ] Clear mined transactions from mempool
- [ ] Difficulty adjustment over time

### 6. Wallet

- [ ] Generate wallet (key pair + address)
- [ ] Create and sign outgoing transactions
- [ ] Select UTXOs to fund a payment

### 7. Network & API

- [ ] REST API works with your blockchain (`npm test -- tests/api`)
- [ ] P2P WebSocket: broadcast chain and transactions
- [ ] Replace local chain with longer valid peer chain
- [ ] Optional peer: `PEER_HOST`, `PEER_PORT`

### 8. Persistence

- [ ] Save blockchain state to JSON file
- [ ] Load blockchain state from JSON file

### 9. Tests

- [ ] All unit, integration, API, P2P, and storage tests pass (`npm test`)

### 10. Submit

- [ ] Clean repo (no secrets, no `node_modules` committed)
- [ ] `npm test` passes on a fresh clone
- [ ] README includes your architecture notes + how to run
- [ ] Optional: curl demo or Postman collection

---

## Quick start

```bash
npm install
npm test
npm start
```

```bash
curl http://localhost:3001/wallet
curl -X POST http://localhost:3001/mine
curl http://localhost:3001/blocks
```

Note about `npm start` vs `npm run dev` (candidate mode)
- `npm start` now runs a lightweight demo stub server (safe for quick demos and candidates). It exposes the API endpoints used by `candidate/demo-client-template.js` and does not require implementing the full blockchain engine.
- `npm run dev` launches the real node (`src/index.js`) and requires the full backend implementation (crypto, core, UTXO, mempool, P2P). Use `npm run dev` only if you are completing the full-backend assignment.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | HTTP API |
| `P2P_PORT` | 6001 | WebSocket P2P |
| `DIFFICULTY` | 2 | Initial PoW difficulty |
| `PEER_HOST` / `PEER_PORT` | — | Connect to peer |

## API (implemented in `src/api` — uses your blockchain)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/blocks` | Full chain |
| GET | `/chain/length` | Block count |
| GET | `/balance?address=` | UTXO balance |
| GET | `/mempool` | Pending transactions |
| GET | `/wallet` | Miner address |
| POST | `/mine` | Mine block |
| POST | `/transactions` | `{ "recipient", "amount" }` |

## Project layout

```
src/
  crypto/       ← implement
  core/         ← implement
  network/      ← implement
  storage/      ← implement
  api/          provided
  config.js     provided
tests/          provided (do not modify)
```

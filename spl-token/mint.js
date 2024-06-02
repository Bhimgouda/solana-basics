import { mintTo } from '@solana/spl-token';
import { Connection } from '@solana/web3.js';
import { mintAddress, mintAuthority, payer, tokenAccount } from './utils.js';

const connection = new Connection('http://localhost:8899');

await mintTo(
  connection,
  payer,
  mintAddress,
  tokenAccount,
  mintAuthority,
  1_000_000_000
);

import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  getAccount,
  transfer,
  getAssociatedTokenAddress
} from '@solana/spl-token';
import { payer, mintAddress } from './utils.js';

const connection = new Connection('http://localhost:8899');

const toWallet = Keypair.generate();
const fromWallet = new PublicKey(process.argv[2]);

const fromTokenAccount = await getAssociatedTokenAddress(
  mintAddress,
  fromWallet
);
const toTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  payer,
  mintAddress,
  toWallet.publicKey
);

const amount = Number(process.argv[3]);

await transfer(
  connection,
  payer,
  fromTokenAccount,
  toTokenAccount.address,
  payer.publicKey,
  amount
);

console.log(
  `Transferred ${amount} tokens from ${fromTokenAccount.toBase58()} to ${toTokenAccount.address.toBase58()}`
);

const currentFromAccount = await getAccount(connection, fromTokenAccount);
const currentToAccount = await getAccount(connection, toTokenAccount.address);

console.log(currentFromAccount, currentToAccount);

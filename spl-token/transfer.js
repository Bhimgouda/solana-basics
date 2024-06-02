import {
  getAccount,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  transfer
} from '@solana/spl-token';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { mintAddress, payer } from './utils.js';

const connection = new Connection('http://localhost:8899');
const toWallet = Keypair.generate(); // Random Address
const fromWallet = new PublicKey(process.argv[2]);
const amount = 1_000_000;

const fromTokenAddress = await getAssociatedTokenAddress(
  mintAddress,
  fromWallet
);

const fromTokenAccount = await getAccount(connection, fromTokenAddress);
const toTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  payer,
  mintAddress,
  toWallet.publicKey
);

await transfer(
  connection,
  payer,
  fromTokenAccount.address,
  toTokenAccount.address,
  fromTokenAccount.owner,
  amount
);

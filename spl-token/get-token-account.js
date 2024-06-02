import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { mintAddress } from './utils.js';

const connection = new Connection('http://localhost:8899');
const userPublicKey = new PublicKey(process.argv[2]);

const tokenAddress = await getAssociatedTokenAddress(
  mintAddress,
  userPublicKey
);

const tokenAccount = await getAccount(connection, tokenAddress);

console.log(tokenAccount);

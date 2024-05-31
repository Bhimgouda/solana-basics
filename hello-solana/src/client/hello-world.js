import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import * as borsh from 'borsh';

// Constants

const GREETING_SEED = 'justASeed';

export const establishConnection = () => {
  return new Connection('http://localhost:8899');
};

export const establishPayer = async () => {
  const secretKeyString = await readFile(
    '/Users/bhimgouda/.config/solana/id.json',
    'utf8'
  );

  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
};

export const getProgramId = async () => {
  const currentPath = path.dirname(fileURLToPath(import.meta.url));
  const secretKeyString = await readFile(
    path.join(currentPath, '../../dist/program/helloworld-keypair.json'),
    'utf8'
  );

  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  const keypair = Keypair.fromSecretKey(secretKey);
  return keypair.publicKey;
};

// To get pub key of PDA derived from payer + seed + programId(owner)
export const getAccountPubkey = async (payer, programId) => {
  return PublicKey.createWithSeed(payer.publicKey, GREETING_SEED, programId);
};

export const checkProgram = async (
  connection,
  payer,
  programId,
  accountPubkey
) => {
  const programAccount = await connection.getAccountInfo(programId);
  if (programAccount === null) {
    throw Error("Program Account Doesn't exist");
  }

  if (programAccount.executable === false) {
    throw Error('Program is unexecutable');
  }

  const programDataAccount = await connection.getAccountInfo(accountPubkey);
  if (programDataAccount === null) {
    console.log('Creating Program Data Account');
    await createAccount(connection, payer, programId, accountPubkey);
  }
};

class HelloWorldAccount {
  constructor(fields) {
    if (fields) {
      this.counter = fields.counter;
    }
  }
}

const HelloWorldSchema = new Map([
  [HelloWorldAccount, { kind: 'struct', fields: [['counter', 'u32']] }]
]);

export const createAccount = async (
  connection,
  payer,
  programId,
  accountPubkey
) => {
  const ACCOUNT_SIZE = borsh.serialize(
    HelloWorldSchema,
    new HelloWorldAccount()
  ).length;

  const lamports = await connection.getMinimumBalanceForRentExemption(
    ACCOUNT_SIZE
  );

  const transaction = new Transaction().add(
    SystemProgram.createAccountWithSeed({
      fromPubkey: payer.publicKey,
      basePubkey: payer.publicKey,
      seed: GREETING_SEED,
      newAccountPubkey: accountPubkey,
      lamports,
      space: ACCOUNT_SIZE,
      programId
    })
  );

  await sendAndConfirmTransaction(connection, transaction, [payer]);
};

export const sayHello = async (connection, payer, programId, accountPubkey) => {
  console.log(`Saying hello to ${accountPubkey.toBase58()}`);
  const instruction = new TransactionInstruction({
    keys: [{ pubkey: accountPubkey, isSigner: false, isWritable: true }],
    programId,
    data: Buffer.alloc(0)
  });

  const transaction = new Transaction().add(instruction);
  await sendAndConfirmTransaction(connection, transaction, [payer]);
};

export const getHelloCount = async (connection, accountPubkey) => {
  let accountInfo = await connection.getAccountInfo(accountPubkey);
  const greeting = borsh.deserialize(
    HelloWorldSchema,
    HelloWorldAccount,
    accountInfo.data
  );
  return greeting;
};

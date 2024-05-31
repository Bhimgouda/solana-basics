import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import * as borsh from 'borsh';
import { PublicKey } from '@metaplex-foundation/js';

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const MESSAGE_SEED = 'fcc-seed';

export const establishConnection = () => {
  return new Connection('http://localhost:8899');
};

// Returns Payer's keypair
export const establishPayer = async () => {
  const secretKeyString = await fs.readFile(
    path.join(CURRENT_DIR, '../wallet.json'),
    'utf-8'
  );
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
};

// Returns Program Id / Program's Public Key
export const getProgramPubkey = async () => {
  const secretKeyString = await fs.readFile(
    path.join(CURRENT_DIR, '../dist/program/message-keypair.json'),
    'utf-8'
  );
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  const keypair = Keypair.fromSecretKey(secretKey);
  return keypair.publicKey;
};

// To get pub key / id of PDA derived from payer + seed + programPubkey(owner)
export const getAccountPubkey = async (payer, programPubkey) => {
  return PublicKey.createWithSeed(payer.publicKey, MESSAGE_SEED, programPubkey);
};

export const checkProgram = async (
  connection,
  payer,
  programId,
  dataAccountId
) => {
  const programAccount = await connection.getAccountInfo(programId);
  if (programAccount === null) {
    throw Error("Program Account Doesn't Exist");
  }
  if (programAccount.executable === false) {
    throw Error('Program is unexecutable');
  }

  const programDataAccount = await connection.getAccountInfo(dataAccountId);

  if (programDataAccount === null) {
    console.log('Creating Program Data Account');
    await createAccount(connection, payer, programId, dataAccountId);
  }
};

export const modifyMessage = async (
  connection,
  payer,
  programId,
  dataAccountId,
  message
) => {
  const instruction = new TransactionInstruction({
    keys: [{ pubkey: dataAccountId, isSigner: false, isWritable: true }],
    programId: programId,
    data: Buffer.from(message)
  });

  console.log('Modifying the message');
  const transaction = new Transaction().add(instruction);
  await sendAndConfirmTransaction(connection, transaction, [payer]);
  console.log('Modified the message');
};

export const getMessage = async (connection, dataAccountId) => {
  let accountInfo = await connection.getAccountInfo(dataAccountId);
  const message = borsh.deserialize(
    MessageSchema,
    MessageAccount,
    accountInfo.data
  );
  console.log(message);
  return message;
};

// Program Data Account Structure

class MessageAccount {
  constructor(fields) {
    if (fields) {
      this.message = fields.message;
    }
  }
}

const MessageSchema = new Map([
  [MessageAccount, { kind: 'struct', fields: [['message', 'string']] }]
]);

export const createAccount = async (
  connection,
  payer,
  programId,
  dataAccountId
) => {
  const ACCOUNT_SIZE = 280;

  const lamports = await connection.getMinimumBalanceForRentExemption(
    ACCOUNT_SIZE
  );

  const transaction = new Transaction().add(
    SystemProgram.createAccountWithSeed({
      fromPubkey: payer.publicKey,
      basePubkey: payer.publicKey,
      seed: MESSAGE_SEED,
      newAccountPubkey: dataAccountId,
      lamports,
      space: ACCOUNT_SIZE,
      programId: programId
    })
  );

  await sendAndConfirmTransaction(connection, transaction, [payer]);
};

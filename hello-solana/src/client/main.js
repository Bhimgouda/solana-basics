import { Connection } from '@solana/web3.js';
import {
  checkProgram,
  establishConnection,
  establishPayer,
  getAccountPubkey,
  getHelloCount,
  getProgramId,
  sayHello
} from './hello-world.js';

const main = async () => {
  const connection = establishConnection();
  const programId = await getProgramId();
  const payer = await establishPayer();
  const accountPubkey = await getAccountPubkey(payer, programId);

  await checkProgram(connection, payer, programId, accountPubkey);
  await sayHello(connection, payer, programId, accountPubkey);

  const helloCount = await getHelloCount(connection, accountPubkey);
  console.log(helloCount);
};

await main();

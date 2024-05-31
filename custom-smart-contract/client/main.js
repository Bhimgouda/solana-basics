import {
  checkProgram,
  establishConnection,
  establishPayer,
  getAccountPubkey,
  getMessage,
  getProgramPubkey,
  modifyMessage
} from './message.js';

const main = async () => {
  const message = process.argv[2];
  if (!message) {
    throw Error('No message provided');
  }

  const connection = establishConnection();
  const payer = await establishPayer();
  const programPubkey = await getProgramPubkey();
  const dataAccountPubkey = await getAccountPubkey(payer, programPubkey);

  await checkProgram(connection, payer, programPubkey, dataAccountPubkey);
  await modifyMessage(
    connection,
    payer,
    programPubkey,
    dataAccountPubkey,
    message
  );
  const newMessage = await getMessage(connection, dataAccountPubkey);
  console.log(
    `This ${newMessage} new Message has been written into PDA account's state`
  );
};

main();

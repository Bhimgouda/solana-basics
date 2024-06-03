import {
  Metaplex,
  keypairIdentity,
  toMetaplexFile
} from '@metaplex-foundation/js';
import { Connection } from '@solana/web3.js';
import { WALLET_KEYPAIR, localStorage } from './utils.js';
import fs from 'fs/promises';

const connection = new Connection('http://127.0.0.1:8899');
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(WALLET_KEYPAIR))
  .use(
    localStorage({
      baseUrl: 'http://127.0.0.1:3001/'
    })
  );

const imageBuffer = await fs.readFile('./assets/pic.png');
const file = toMetaplexFile(imageBuffer, 'pic.png');
const imageUri = await metaplex.storage().upload(file);
const { uri: metadataUri } = await metaplex
  .nfts()
  .uploadMetadata({ name: 'MOI', description: 'The MOI NFT', image: imageUri });

const createResponse = await metaplex.nfts().create({
  name: 'MOI',
  uri: metadataUri,
  sellerFeeBasisPoints: 21,
  maxSupply: 1
});

console.log(createResponse);

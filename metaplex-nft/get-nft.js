import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import { Connection, PublicKey } from '@solana/web3.js';
import { WALLET_KEYPAIR, localStorage, pkg } from './utils.js';
import fs from 'fs/promises';

const connection = new Connection('http://127.0.0.1:8899');
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(WALLET_KEYPAIR))
  .use(
    localStorage({
      baseUrl: 'http://127.0.0.1:3001/'
    })
  );

const mintAddress = new PublicKey(pkg.env.MINT_ACCOUNT_ADDRESS);
const nft = await metaplex.nfts().findByMint({
  mintAddress
});

const imageData = await metaplex.storage().download(nft.json.image);
await fs.writeFile('./assets/downloaded-nft-pic.png', imageData.buffer);

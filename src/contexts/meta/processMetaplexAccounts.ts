import { AccountInfo, PublicKey } from '@solana/web3.js';

import { METAPLEX_ID, programIds, pubkeyToString } from '../../utils';
import { ParsedAccount } from '../accounts';
import { cache } from '../accounts';



const isMetaplexAccount = (account: AccountInfo<Buffer>) =>
  account && pubkeyToString(account.owner) === METAPLEX_ID;

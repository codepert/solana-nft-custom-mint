import { AccountInfo } from '@solana/web3.js';
import {
  Edition,
  MasterEditionV1,
  MasterEditionV2,
  Metadata,
} from '../actions';

import { PublicKeyStringAndAccount, StringPublicKey } from '../../utils';
import { ParsedAccount } from '../accounts/types';

export type AccountAndPubkey = {
  pubkey: string;
  account: AccountInfo<Buffer>;
};

export type CheckAccountFunc = (account: AccountInfo<Buffer>) => boolean;

export type UnPromise<T extends Promise<any>> = T extends Promise<infer U>
  ? U
  : never;

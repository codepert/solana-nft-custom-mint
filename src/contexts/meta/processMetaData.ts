import { AccountInfo } from '@solana/web3.js';
import {
  decodeEdition,
  decodeMasterEdition,
  decodeMetadata,
  Edition,
  MasterEditionV1,
  MasterEditionV2,
  Metadata,
  MetadataKey,
} from '../actions';
import { ParsedAccount } from '../accounts/types';
import { METADATA_PROGRAM_ID, pubkeyToString } from '../../utils';

const isMetadataAccount = (account: AccountInfo<Buffer>) =>
  account && pubkeyToString(account.owner) === METADATA_PROGRAM_ID;

const isMetadataV1Account = (account: AccountInfo<Buffer>) =>
  account.data[0] === MetadataKey.MetadataV1;

const isEditionV1Account = (account: AccountInfo<Buffer>) =>
  account.data[0] === MetadataKey.EditionV1;

const isMasterEditionAccount = (account: AccountInfo<Buffer>) =>
  account.data[0] === MetadataKey.MasterEditionV1 ||
  account.data[0] === MetadataKey.MasterEditionV2;

const isMasterEditionV1 = (
  me: MasterEditionV1 | MasterEditionV2,
): me is MasterEditionV1 => {
  return me.key === MetadataKey.MasterEditionV1;
};

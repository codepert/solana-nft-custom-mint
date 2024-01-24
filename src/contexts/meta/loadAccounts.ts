import {
    AUCTION_ID,
    METADATA_PROGRAM_ID,
    METAPLEX_ID,
    StringPublicKey,
    toPublicKey,
    VAULT_ID,
} from '../../utils';
import { TokenAccount } from '../models';
import {
    getEdition,
    Metadata,
    MAX_CREATOR_LEN,
    MAX_CREATOR_LIMIT,
    MAX_NAME_LENGTH,
    MAX_SYMBOL_LENGTH,
    MAX_URI_LENGTH,
    decodeMetadata,
    getMetadata,
} from '../actions';
import { uniqWith } from 'lodash';

import { Connection, PublicKey } from '@solana/web3.js';
import {
    AccountAndPubkey,
    UnPromise,
} from './types';


const MULTIPLE_ACCOUNT_BATCH_SIZE = 100;

export const USE_SPEED_RUN = false;
const WHITELISTED_METADATA = ['98vYFjBYS9TguUMWQRPjy2SZuxKuUMcqR4vnQiLjZbte'];
const WHITELISTED_AUCTION = ['D8wMB5iLZnsV7XQjpwqXaDynUtFuDs7cRXvEGNj1NF1e'];
const AUCTION_TO_METADATA: Record<string, string[]> = {
    D8wMB5iLZnsV7XQjpwqXaDynUtFuDs7cRXvEGNj1NF1e: [
        '98vYFjBYS9TguUMWQRPjy2SZuxKuUMcqR4vnQiLjZbte',
    ],
};
const AUCTION_TO_VAULT: Record<string, string> = {
    D8wMB5iLZnsV7XQjpwqXaDynUtFuDs7cRXvEGNj1NF1e:
        '3wHCBd3fYRPWjd5GqzrXanLJUKRyU3nECKbTPKfVwcFX',
};
const WHITELISTED_AUCTION_MANAGER = [
    '3HD2C8oCL8dpqbXo8hq3CMw6tRSZDZJGajLxnrZ3ZkYx',
];
const WHITELISTED_VAULT = ['3wHCBd3fYRPWjd5GqzrXanLJUKRyU3nECKbTPKfVwcFX'];

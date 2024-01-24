import { WalletAdapter, WalletError } from '@solana/wallet-adapter-base';



export enum MetadataCategory {
    Audio = 'audio',
    Video = 'video',
    Image = 'image',
    VR = 'vr',
    HTML = 'html',
}

export type FileOrString = MetadataFile | string;

export type MetadataFile = {
    uri: string;
    type: string;
};


export type Attribute = {
    trait_type?: string;
    display_type?: string;
    value: string | number;
};

export class Creator {
    address: StringPublicKey;
    verified: boolean;
    share: number;

    constructor(args: {
        address: StringPublicKey;
        verified: boolean;
        share: number;
    }) {
        this.address = args.address;
        this.verified = args.verified;
        this.share = args.share;
    }
}

export interface IMetadataExtension {
    name: string;
    symbol: string;

    creators: Creator[] | null;
    description: string;
    // preview image absolute URI
    image: string;
    animation_url?: string;

    attributes?: Attribute[];

    // stores link to item on meta
    external_url: string;

    seller_fee_basis_points: number;

    properties: {
        files?: FileOrString[];
        category: MetadataCategory;
        maxSupply?: number;
        creators?: {
            address: string;
            shares: number;
        }[];
    };
}

export type WalletSigner = Pick<
    WalletAdapter,
    // @ts-ignore
    'publicKey' | 'signTransaction' | 'signAllTransactions'
>;

import { PublicKey, AccountInfo } from '@solana/web3.js';

export type StringPublicKey = string;

const PubKeysInternedMap = new Map<string, PublicKey>();

export enum ArtType {
    Master,
    Print,
    NFT,
}
export interface Art {
    uri: string | undefined;
    mint: string | undefined;
    link: string;
    title: string;
    artist: string;
    seller_fee_basis_points?: number;
    creators?: Artist[];
    type: ArtType;
    edition?: number;
    supply?: number;
    maxSupply?: number;
}

export interface Artist {
    address?: string;
    name: string;
    link: string;
    image: string;
    itemsAvailable?: number;
    itemsSold?: number;
    about?: string;
    verified?: boolean;
    background?: string;
    share?: number;
}
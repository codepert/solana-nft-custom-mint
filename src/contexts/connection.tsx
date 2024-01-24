import React, { useContext, useEffect, useMemo, useState } from 'react';

import {
    Keypair,
    clusterApiUrl,
    Commitment,
    Connection,
    RpcResponseAndContext,
    SignatureStatus,
    SimulatedTransactionResponse,
    Transaction,
    TransactionInstruction,
    TransactionSignature,
    Blockhash,
    FeeCalculator,
} from '@solana/web3.js';

import {
    TokenInfo,
    TokenListProvider,
    ENV as ChainId,
} from '@solana/spl-token-registry';

export const ENDPOINTS = [
    {
        name: 'mainnet-beta' as ENV,
        endpoint: 'https://api.metaplex.solana.com/',
        ChainId: ChainId.MainnetBeta,
    },
    {
        name: 'mainnet-beta (Solana)' as ENV,
        endpoint: 'https://api.mainnet-beta.solana.com',
        ChainId: ChainId.MainnetBeta,
    },
    {
        name: 'mainnet-beta (Serum)' as ENV,
        endpoint: 'https://solana-api.projectserum.com/',
        ChainId: ChainId.MainnetBeta,
    },
    {
        name: 'testnet' as ENV,
        endpoint: clusterApiUrl('testnet'),
        ChainId: ChainId.Testnet,
    },
    {
        name: 'devnet' as ENV,
        endpoint: clusterApiUrl('devnet'),
        ChainId: ChainId.Devnet,
    },
];

const DEFAULT = ENDPOINTS[0].endpoint;


export type ENV =
    | 'mainnet-beta'
    | 'mainnet-beta (Solana)'
    | 'mainnet-beta (Serum)'
    | 'testnet'
    | 'devnet'
    | 'localnet'
    | 'lending';


interface ConnectionConfig {
    connection: Connection;
    endpoint: string;
    env: ENV;
    setEndpoint: (val: string) => void;
    tokens: TokenInfo[];
    tokenMap: Map<string, TokenInfo>;
}

const ConnectionContext = React.createContext<ConnectionConfig>({
    endpoint: DEFAULT,
    setEndpoint: () => { },
    connection: new Connection(DEFAULT, 'recent'),
    env: ENDPOINTS[0].name,
    tokens: [],
    tokenMap: new Map<string, TokenInfo>(),
});

export function useConnection() {
    return useContext(ConnectionContext).connection as Connection;
}

export function useConnectionConfig() {
    const context = useContext(ConnectionContext);
    return {
        endpoint: context.endpoint,
        setEndpoint: context.setEndpoint,
        env: context.env,
        tokens: context.tokens,
        tokenMap: context.tokenMap,
    };
}

import { WalletSigner } from './wallet'

interface BlockhashAndFeeCalculator {
    blockhash: Blockhash;
    feeCalculator: FeeCalculator;
}
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';

export const sendTransactionWithRetry = async (
    connection: Connection,
    wallet: WalletSigner,
    instructions: TransactionInstruction[],
    signers: Keypair[],
    commitment: Commitment = 'singleGossip',
    includesFeePayer: boolean = false,
    block?: BlockhashAndFeeCalculator,
    beforeSend?: () => void,
) => {
    if (!wallet.publicKey) throw new WalletNotConnectedError();

    let transaction = new Transaction();
    instructions.forEach(instruction => transaction.add(instruction));
    transaction.recentBlockhash = (
        block || (await connection.getRecentBlockhash(commitment))
    ).blockhash;

    if (includesFeePayer) {
        transaction.setSigners(...signers.map(s => s.publicKey));
    } else {
        transaction.setSigners(
            // fee payed by the wallet owner
            wallet.publicKey,
            ...signers.map(s => s.publicKey),
        );
    }

    if (signers.length > 0) {
        transaction.partialSign(...signers);
    }
    if (!includesFeePayer) {
        // @ts-ignore
        transaction = await wallet.signTransaction(transaction);
    }

    if (beforeSend) {
        beforeSend();
    }

    const { txid, slot } = await sendSignedTransaction({
        connection,
        signedTransaction: transaction,
    });

    return { txid, slot };
};


const DEFAULT_TIMEOUT = 60000;
import {
    sleep
} from './utils'

export async function sendSignedTransaction({
    signedTransaction,
    connection,
    timeout = DEFAULT_TIMEOUT,
}: {
    signedTransaction: Transaction;
    connection: Connection;
    sendingMessage?: string;
    sentMessage?: string;
    successMessage?: string;
    timeout?: number;
}): Promise<{ txid: string; slot: number }> {
    const rawTransaction = signedTransaction.serialize();
    const startTime = getUnixTs();
    let slot = 0;
    const txid: TransactionSignature = await connection.sendRawTransaction(
        rawTransaction,
        {
            skipPreflight: true,
        },
    );

    console.log('Started awaiting confirmation for', txid);

    let done = false;
    (async () => {
        while (!done && getUnixTs() - startTime < timeout) {
            connection.sendRawTransaction(rawTransaction, {
                skipPreflight: true,
            });
            await sleep(500);
        }
    })();
    try {
        const confirmation = await awaitTransactionSignatureConfirmation(
            txid,
            timeout,
            connection,
            'recent',
            true,
        );

        if (!confirmation)
            throw new Error('Timed out awaiting confirmation on transaction');

        if (confirmation.err) {
            console.error(confirmation.err);
            throw new Error('Transaction failed: Custom instruction error');
        }

        slot = confirmation?.slot || 0;
    } catch (err: any) {
        console.error('Timeout Error caught', err);
        if (err.timeout) {
            throw new Error('Timed out awaiting confirmation on transaction');
        }
        let simulateResult: SimulatedTransactionResponse | null = null;
        try {
            simulateResult = (
                await simulateTransaction(connection, signedTransaction, 'single')
            ).value;
            // eslint-disable-next-line no-empty
        } catch (e) { }
        if (simulateResult && simulateResult.err) {
            if (simulateResult.logs) {
                for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
                    const line = simulateResult.logs[i];
                    if (line.startsWith('Program log: ')) {
                        throw new Error(
                            'Transaction failed: ' + line.slice('Program log: '.length),
                        );
                    }
                }
            }
            throw new Error(JSON.stringify(simulateResult.err));
        }
        // throw new Error('Transaction failed');
    } finally {
        done = true;
    }

    console.log('Latency', txid, getUnixTs() - startTime);
    return { txid, slot };
}


async function simulateTransaction(
    connection: Connection,
    transaction: Transaction,
    commitment: Commitment,
): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> {
    // @ts-ignore
    transaction.recentBlockhash = await connection._recentBlockhash(
        // @ts-ignore
        connection._disableBlockhashCaching,
    );

    const signData = transaction.serializeMessage();
    // @ts-ignore
    const wireTransaction = transaction._serialize(signData);
    const encodedTransaction = wireTransaction.toString('base64');
    const config: any = { encoding: 'base64', commitment };
    const args = [encodedTransaction, config];

    // @ts-ignore
    const res = await connection._rpcRequest('simulateTransaction', args);
    if (res.error) {
        throw new Error('failed to simulate transaction: ' + res.error.message);
    }
    return res.result;
}


export const getUnixTs = () => {
    return new Date().getTime() / 1000;
};


async function awaitTransactionSignatureConfirmation(
    txid: TransactionSignature,
    timeout: number,
    connection: Connection,
    commitment: Commitment = 'recent',
    queryStatus = false,
): Promise<SignatureStatus | null | void> {
    let done = false;
    let status: SignatureStatus | null | void = {
        slot: 0,
        confirmations: 0,
        err: null,
    };
    let subId = 0;
    status = await (async (): Promise<SignatureStatus | null | void> => {
        setTimeout(() => {
            if (done) {
                return;
            }
            done = true;
            console.log('Rejecting for timeout...');
            throw { timeout: true };
        }, timeout);
        try {
            return await new Promise((resolve, reject) => {
                subId = connection.onSignature(
                    txid,
                    (result, context) => {
                        done = true;
                        const nextStatus = {
                            err: result.err,
                            slot: context.slot,
                            confirmations: 0,
                        };
                        if (result.err) {
                            console.log('Rejected via websocket', result.err);
                            reject(nextStatus);
                        } else {
                            console.log('Resolved via websocket', result);
                            resolve(nextStatus);
                        }
                    },
                    commitment,
                );
            });
        } catch (e) {
            done = true;
            console.error('WS error in setup', txid, e);
        }
        while (!done && queryStatus) {
            try {
                const signatureStatuses = await connection.getSignatureStatuses([txid]);
                const nextStatus = signatureStatuses && signatureStatuses.value[0];
                if (!done) {
                    if (!nextStatus) {
                        console.log('REST null result for', txid, nextStatus);
                    } else if (nextStatus.err) {
                        console.log('REST error for', txid, nextStatus);
                        done = true;
                        throw nextStatus.err;
                    } else if (!nextStatus.confirmations) {
                        console.log('REST no confirmations for', txid, nextStatus);
                    } else {
                        console.log('REST confirmation for', txid, nextStatus);
                        done = true;
                        return nextStatus;
                    }
                }
            } catch (e) {
                if (!done) {
                    console.log('REST connection error: txid', txid, e);
                }
            }
            await sleep(2000);
        }
    })();

    //@ts-ignore
    if (connection._signatureSubscriptions[subId])
        connection.removeSignatureListener(subId);
    done = true;
    console.log('Returning status', status);
    return status;
}

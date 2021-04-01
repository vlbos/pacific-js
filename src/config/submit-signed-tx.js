export default function (api, txn, sender) {
    const txnId = `${sender.key.meta.name}+${sender.nonce}`;
    const getType = (arg) => `${arg.type}` === 'Bytes' && arg.Type.name === 'Text' ? 'Text' : arg.type;
    const args = txn.args.map((arg, idx) => `${api.registry.createType(getType(txn.meta.args[idx]), arg)}`);
    console.log(` > [${txnId}] Submitting: ${txn.method.section}.${txn.method.method}(${args})`);
    return new Promise(async (resolve, reject) => {
        try {
            // retrieve sender's next index/nonce, taking txs in the pool into account
            // if (0 == sender.nonce) {
            //     console.log("sender.nonce==7==", sender.nonce);
            //     let nonce = await api.rpc.system.accountNextIndex(sender.key.address);
            //     if (0 != nonce.words[0]) {
            //         sender.nonce = nonce.words[0];
            //         console.log("sender.nonce==77==", sender.nonce);
            //     }
            // }
            // import type { AccountId, Balance, Header, Index } from '@polkadot/types/interfaces';
            // let acc = await api.query.system.account(sender.key.address);
            //   const nonce1 = await api.query.system.accountNonce<Index>(sender.key.address);
            //   const nonce2 = await api.query.system.accountNonce(sender.key.address);

            console.log("sender.nonce====", sender.nonce);
            const drop = await txn.signAndSend(sender.key, { nonce: sender.nonce++ }, ({ status, events, dispatchError }) => {
                if (!status.isInBlock && !status.isFinalized) {
                    return;
                }

                drop();
                if (dispatchError) {
                    if (!dispatchError.isModule) throw `${dispatchError}`;
                    const decoded = api.registry.findMetaError(dispatchError.asModule);
                    console.log(JSON.stringify(decoded));
                    throw decoded.documentation.join(' ');
                }

                console.log(` < [${txnId}] In block: ${status.asInBlock}`);
                resolve(events);
            });
        } catch (e) {
            reject(`${e}`);
        }
    });
}

// async function initmetedata()
// {
// const rpcData = await provider.send('state_getMetadata', []);
//       const genesisHash = registry.createType('Hash', await provider.send('chain_getBlockHash', [])).toHex();
//       const specVersion = 0;
//       const metadata: any = {};
//       const key = `${genesisHash}-${specVersion}`;

//       // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//       metadata[key] = rpcData;

//       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//       const api = await ApiPromise.create({ metadata, provider, registry } as ApiOptions);

//     //   expect(api.genesisHash).toBeDefined();
//     //   expect(api.runtimeMetadata).toBeDefined();
//     //   expect(api.runtimeVersion).toBeDefined();
//     //   expect(api.rpc).toBeDefined();
//     //   expect(api.query).toBeDefined();
//     //   expect(api.tx).toBeDefined();
//     //   expect(api.derive).toBeDefined();
// }
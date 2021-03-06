/*
 * Copyright 2018-2020 TON DEV SOLUTIONS LTD.
 *
 * Licensed under the SOFTWARE EVALUATION License (the "License"); you may not use
 * this file except in compliance with the License.  You may obtain a copy of the
 * License at:
 *
 * http://www.ton.dev/licenses
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific TON DEV software governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-bitwise */

import { tests } from "./_/init-tests";
import { exportAllDeclaration } from "@babel/types";

const SubscriptionContractPackage = tests.loadPackage('Subscription');

beforeAll(tests.init);
afterAll(tests.done);

test("RunLocal", async () => {
    const ton = tests.client;
    const keys = await ton.crypto.ed25519Keypair();
    console.log(`Keys: ${JSON.stringify(keys)}`);

    const walletAddress = '0:2222222222222222222222222222222222222222222222222222222222222222';

    // Deploy custom contract
    const { address: packageAddress, transaction } = (await tests.deploy_with_giver({
        package: SubscriptionContractPackage,
        constructorParams: {
            wallet: walletAddress,
        },
        keyPair: keys,
    }));

    console.log(`Contract address: ${packageAddress}`);

    // Get the returned value with runLocal
    const runLocalResponse = await ton.contracts.runLocal({
        address: packageAddress,
        abi: SubscriptionContractPackage.abi,
        functionName: 'getWallet',
        input: {},
        keyPair: keys,
        waitParams: {
            timeout: 100_000
        }
    });

    expect(runLocalResponse.output).toEqual({
            value0: "0:2222222222222222222222222222222222222222222222222222222222222222"
    });

    const subscriptionParams = {
        subscriptionId: "0x1111111111111111111111111111111111111111111111111111111111111111",
        pubkey: "0x2222222222222222222222222222222222222222222222222222222222222222",
        to: "0:3333333333333333333333333333333333333333333333333333333333333333",
        value: "0x123",
        period: "0x456"
    };

    const subscribeResult = await ton.contracts.run({
        address: packageAddress,
        abi: SubscriptionContractPackage.abi,
        functionName: 'subscribe',
        input: subscriptionParams,
        keyPair: keys,
    });

    const getSubscriptionResult = await ton.contracts.runLocal({
        address: packageAddress,
        abi: SubscriptionContractPackage.abi,
        functionName: 'getSubscription',
        input: {
            "subscriptionId": subscriptionParams.subscriptionId
        },
        keyPair: keys,
        waitParams: {
            transactionLt: subscribeResult.transaction.lt,
            timeout: 100_000
        }
    });

    expect(getSubscriptionResult.output.value0.pubkey).toEqual(subscriptionParams.pubkey);
});

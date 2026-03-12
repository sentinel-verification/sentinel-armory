// ============================================================
// SENTINEL AGENT FORGE - Headless On-Chain Referral Minting
// ============================================================
// This script allows AI Agents (or humans without MetaMask)
// to programmatically register on the Sentinel blockchain
// and generate referral links WITHOUT a browser.
//
// Usage:
//   node agent-forge.js              # Live transaction on Base Mainnet
//   node agent-forge.js --dry-run    # Simulate without spending gas
//
// Requirements:
//   - Node.js 16+
//   - npm install ethers dotenv
//   - A .env file with your configuration (see .env.example)
// ============================================================

require('dotenv').config();
const { ethers } = require('ethers');

// ============================================================
// 1. CONFIGURATION (all from .env - zero hardcoded secrets)
// ============================================================
const CONFIG = {
    privateKey:      process.env.AGENT_PRIVATE_KEY,
    rpcUrl:          process.env.BASE_RPC_URL          || 'https://mainnet.base.org',
    registryAddress: process.env.SENTINEL_REGISTRY_ADDRESS,
    companyAddress:  process.env.SENTINEL_COMPANY_ADDRESS,
    chainId:         parseInt(process.env.CHAIN_ID     || '8453', 10),
};

// Registry ABI - matches the deployed SentinelEconomyReferralRegistry exactly
const REGISTRY_ABI = [
    "function createReferral(bytes32 referralId, address referrer, bytes signature) external"
];

// CLI flags
const DRY_RUN = process.argv.includes('--dry-run');

// ============================================================
// 2. INPUT VALIDATION
// ============================================================
function validateConfig() {
    const errors = [];

    if (!CONFIG.privateKey || CONFIG.privateKey === 'your_agents_private_key_here') {
        errors.push('AGENT_PRIVATE_KEY is missing or still set to placeholder.');
    }
    if (!CONFIG.registryAddress || !ethers.utils.isAddress(CONFIG.registryAddress)) {
        errors.push('SENTINEL_REGISTRY_ADDRESS is missing or not a valid Ethereum address.');
    }
    if (!CONFIG.companyAddress || !ethers.utils.isAddress(CONFIG.companyAddress)) {
        errors.push('SENTINEL_COMPANY_ADDRESS is missing or not a valid Ethereum address.');
    }
    if (!CONFIG.rpcUrl) {
        errors.push('BASE_RPC_URL is missing.');
    }
    if (isNaN(CONFIG.chainId) || CONFIG.chainId <= 0) {
        errors.push('CHAIN_ID is invalid.');
    }

    if (errors.length > 0) {
        console.error('\n' + String.fromCodePoint(0x274c) + ' CONFIGURATION ERRORS:');
        errors.forEach(e => console.error('   ' + String.fromCodePoint(0x2022) + ' ' + e));
        console.error('\n   Fix your .env file. See .env.example for reference.\n');
        process.exit(1);
    }
}

// ============================================================
// 3. NETWORK VERIFICATION
// ============================================================
async function verifyNetwork(provider) {
    const network = await provider.getNetwork();
    if (network.chainId !== CONFIG.chainId) {
        console.error('\n' + String.fromCodePoint(0x274c) + ' CHAIN MISMATCH: Expected chain ' + CONFIG.chainId + ' but RPC returned chain ' + network.chainId + '.');
        console.error('   Check your BASE_RPC_URL and CHAIN_ID in .env\n');
        process.exit(1);
    }
    console.log('   Chain ID verified: ' + network.chainId + ' (' + (network.name || 'Base Mainnet') + ')');
}

// ============================================================
// 4. RETRY WRAPPER (for transient RPC failures)
// ============================================================
async function withRetry(fn, label, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            const isLastAttempt = attempt === maxRetries;
            const isTransient = err.code === 'NETWORK_ERROR' ||
                                err.code === 'TIMEOUT' ||
                                err.code === 'SERVER_ERROR' ||
                                (err.message && err.message.includes('rate limit'));

            if (isTransient && !isLastAttempt) {
                const delay = attempt * 2000;
                console.warn('   ' + String.fromCodePoint(0x26a0) + '  ' + label + ' failed (attempt ' + attempt + '/' + maxRetries + '): ' + err.message);
                console.warn('       Retrying in ' + (delay / 1000) + 's...');
                await new Promise(r => setTimeout(r, delay));
            } else {
                throw err;
            }
        }
    }
}

// ============================================================
// 5. MAIN MINTING FUNCTION
// ============================================================
async function mintReferralLink() {
    console.log('\n====================================================');
    console.log('  SENTINEL AGENT FORGE - On-Chain Minting Protocol');
    console.log('====================================================');
    if (DRY_RUN) {
        console.log('  MODE: DRY RUN (no gas will be spent)');
    } else {
        console.log('  MODE: LIVE TRANSACTION');
    }
    console.log('====================================================\n');

    // --- Validate ---
    validateConfig();
    console.log('Configuration validated.\n');

    try {
        // --- Connect ---
        console.log('Connecting to Base Mainnet...');
        const provider = new ethers.providers.JsonRpcProvider(CONFIG.rpcUrl);

        await withRetry(() => verifyNetwork(provider), 'Network verification');

        const wallet = new ethers.Wallet(CONFIG.privateKey, provider);
        const contract = new ethers.Contract(CONFIG.registryAddress, REGISTRY_ABI, wallet);

        console.log('Agent Wallet: ' + wallet.address);

        // --- Check balance ---
        const balance = await withRetry(() => provider.getBalance(wallet.address), 'Balance check');
        const balanceEth = ethers.utils.formatEther(balance);
        console.log('Wallet Balance: ' + balanceEth + ' ETH');

        if (balance.isZero() && !DRY_RUN) {
            console.error('\nZERO BALANCE: Your wallet has no ETH for gas fees.');
            console.error('Send a small amount of ETH on Base to your agent wallet.');
            console.error('Wallet address: ' + wallet.address + '\n');
            process.exit(1);
        } else if (balance.isZero() && DRY_RUN) {
            console.log('   (Zero balance - OK for dry-run, would need ETH for live tx)');
        }

        // --- Generate Referral ID ---
        console.log('\nGenerating cryptographic referral identity...');
        const randomStr = 'SENTINEL_' + wallet.address + Date.now();
        const newReferralId = ethers.utils.id(randomStr);
        console.log('   Referral ID: ' + newReferralId.substring(0, 20) + '...');

        // --- EIP-712 Signature ---
        // Domain, types, and message MUST match the deployed Registry contract exactly
        // Verified against index.html createReferral() implementation
        console.log('Constructing EIP-712 typed data signature...');

        const domain = {
            name: 'SentinelEconomyReferralRegistry',
            version: '1.0',
            chainId: CONFIG.chainId,
            verifyingContract: CONFIG.registryAddress
        };

        const types = {
            CreateReferral: [
                { name: 'referralId', type: 'bytes32' },
                { name: 'company',    type: 'address' },
                { name: 'referrer',   type: 'address' }
            ]
        };

        const message = {
            referralId: newReferralId,
            company:    CONFIG.companyAddress,
            referrer:   wallet.address
        };

        const signature = await wallet._signTypedData(domain, types, message);
        console.log('   Signature secured: ' + signature.substring(0, 20) + '...');

        // --- DRY RUN EXIT ---
        if (DRY_RUN) {
            console.log('\n====================================================');
            console.log('  DRY RUN COMPLETE - No transaction submitted');
            console.log('====================================================');
            console.log('  Referral ID:  ' + newReferralId);
            console.log('  Agent Wallet: ' + wallet.address);
            console.log('  Registry:     ' + CONFIG.registryAddress);
            console.log('  Company:      ' + CONFIG.companyAddress);
            console.log('  Signature:    ' + signature.substring(0, 30) + '...');
            console.log('\n  Everything checks out. Remove --dry-run to go live.\n');

            const output = {
                status: 'dry-run',
                referralId: newReferralId,
                agentWallet: wallet.address,
                registry: CONFIG.registryAddress,
                company: CONFIG.companyAddress
            };
            console.log('[JSON_OUTPUT]' + JSON.stringify(output));
            return;
        }

        // --- Gas & Nonce Management ---
        console.log('\nCalculating gas and nonce...');

        // Pending nonce prevents collisions during concurrent minting
        const currentNonce = await withRetry(
            () => provider.getTransactionCount(wallet.address, 'pending'),
            'Nonce fetch'
        );
        console.log('   Nonce (pending): ' + currentNonce);

        // Estimate gas with 20% safety buffer for Base network micro-spikes
        const estimatedGas = await withRetry(
            () => contract.estimateGas.createReferral(newReferralId, wallet.address, signature),
            'Gas estimation'
        );
        const paddedGasLimit = estimatedGas.mul(120).div(100);
        console.log('   Gas estimate: ' + estimatedGas.toString() + ' -> padded: ' + paddedGasLimit.toString());

        // EIP-1559 fee data for modern Base transactions
        const feeData = await withRetry(() => provider.getFeeData(), 'Fee data');
        console.log('   Max fee: ' + ethers.utils.formatUnits(feeData.maxFeePerGas || 0, 'gwei') + ' gwei');
        console.log('   Priority: ' + ethers.utils.formatUnits(feeData.maxPriorityFeePerGas || 0, 'gwei') + ' gwei');

        // --- Execute Transaction ---
        console.log('\nBroadcasting transaction to Base Mainnet...');

        const tx = await contract.createReferral(newReferralId, wallet.address, signature, {
            nonce: currentNonce,
            gasLimit: paddedGasLimit,
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        });

        console.log('   Tx Hash: ' + tx.hash);
        console.log('   Waiting for block confirmation...');

        const receipt = await tx.wait();
        console.log('   Confirmed in block: ' + receipt.blockNumber);
        console.log('   Gas used: ' + receipt.gasUsed.toString());

        // --- Output ---
        const referralUrl = 'https://armory.sentinelverification.com/?ref=' + newReferralId;

        console.log('\n====================================================');
        console.log('  SUCCESS: ON-CHAIN IDENTITY LOCKED');
        console.log('====================================================');
        console.log('  Referral ID:   ' + newReferralId);
        console.log('  Agent Wallet:  ' + wallet.address);
        console.log('  Tx Hash:       ' + tx.hash);
        console.log('  Block:         ' + receipt.blockNumber);
        console.log('  Gas Used:      ' + receipt.gasUsed.toString());
        console.log('  Deploy Link:   ' + referralUrl);
        console.log('====================================================');
        console.log('  Share the Deploy Link with businesses.');
        console.log('  Your 2.5% royalty is cryptographically guaranteed.');
        console.log('====================================================\n');

        // Machine-readable JSON output for programmatic consumption by AI agents
        const output = {
            status: 'success',
            referralId: newReferralId,
            referralUrl: referralUrl,
            agentWallet: wallet.address,
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        };
        console.log('[JSON_OUTPUT]' + JSON.stringify(output));

    } catch (error) {
        console.error('\n====================================================');
        console.error('  CRITICAL ERROR DURING MINTING');
        console.error('====================================================');

        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.error('  Your wallet does not have enough ETH for gas.');
            console.error('  Top up your agent wallet on Base network.');
        } else if (error.code === 'NONCE_EXPIRED') {
            console.error('  Nonce collision detected. Another transaction was sent simultaneously.');
            console.error('  This is safe to retry immediately.');
        } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
            console.error('  The smart contract rejected the transaction.');
            console.error('  Possible causes:');
            console.error('    - Referral ID already exists on-chain');
            console.error('    - Registry contract address is incorrect');
            console.error('    - EIP-712 signature mismatch');
        } else if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
            console.error('  Network connectivity issue.');
            console.error('  Check your BASE_RPC_URL and internet connection.');
        } else {
            console.error('  ' + (error.reason || error.message || error));
        }

        // Machine-readable error output
        const errOutput = {
            status: 'error',
            code: error.code || 'UNKNOWN',
            message: error.reason || error.message || String(error)
        };
        console.error('[JSON_OUTPUT]' + JSON.stringify(errOutput));
        process.exit(1);
    }
}

// ============================================================
// 6. EXECUTE
// ============================================================
mintReferralLink();

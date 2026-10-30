require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xbdd9698bca384accd84d7032d4fa070bc63f46d9363e54dea0b5432176c7f945';
const GANACHE_RPC = process.env.GANACHE_RPC || 'http://127.0.0.1:7545';
const CHAIN_ID = parseInt(process.env.CHAIN_ID || '1337', 10);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    ganache: {
      url: GANACHE_RPC,
      chainId: 1337,
      accounts: [PRIVATE_KEY],
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC || 'https://ethereum-sepolia-rpc.publicnode.com',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    amoy: {
      url: process.env.AMOY_RPC || 'https://rpc-amoy.polygon.technology',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};

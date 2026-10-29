import { ethers } from 'ethers';

export const getProvider = () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to use blockchain features.');
  }
  return new ethers.BrowserProvider(window.ethereum);
};

export const connectWallet = async () => {
  const provider = getProvider();
  await provider.send('eth_requestAccounts', []);
  return provider;
};

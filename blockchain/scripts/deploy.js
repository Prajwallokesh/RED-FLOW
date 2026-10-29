const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying RedFlow contract with account:', deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('Deployer balance:', hre.ethers.formatEther(balance), 'ETH');

  const RedFlow = await hre.ethers.getContractFactory('RedFlow');
  const redFlow = await RedFlow.deploy();

  await redFlow.waitForDeployment();
  const contractAddress = await redFlow.getAddress();

  console.log('\n======================================================');
  console.log('🎉 RedFlow Smart Contract Deployed Successfully!');
  console.log('📍 Contract Address:', contractAddress);
  console.log('======================================================\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });

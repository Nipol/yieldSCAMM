async function main() {
  const StandardTokenTemplate = await ethers.getContractFactory('StandardToken');
  const ScaleTokenTemplate = await ethers.getContractFactory('ScaleToken');
  const SCAMMTemplate = await ethers.getContractFactory('SCAMM');

  // 1. Token 배포
  const scaleToken = await ScaleTokenTemplate.deploy();
  await scaleToken.deployed();
  const yUSDA = await StandardTokenTemplate.deploy();
  await yUSDA.deployed();
  const yUSDB = await StandardTokenTemplate.deploy();
  await yUSDB.deployed();
  const yUSDC = await StandardTokenTemplate.deploy();
  await yUSDC.deployed();
  await yUSDA.deployed();
  await yUSDA.initialize('0x2e6bE9855A3bF02C73Ba74B7d756a63DB7762238', '1', 'yUSDA', 'yUSDA', 18);
  await yUSDB.deployed();
  await yUSDB.initialize('0x2e6bE9855A3bF02C73Ba74B7d756a63DB7762238', '1', 'yUSDB', 'yUSDB', 18);
  await yUSDC.deployed();
  await yUSDC.initialize('0x2e6bE9855A3bF02C73Ba74B7d756a63DB7762238', '1', 'yUSDC', 'yUSDC', 18);

  // 2. SCAMM 배포
  const scamm = await SCAMMTemplate.deploy(
    '0x2e6bE9855A3bF02C73Ba74B7d756a63DB7762238',
    scaleToken.address,
    [yUSDA.address, yUSDB.address, yUSDC.address],
    50, // 0.5%
  );
  await scamm.deployed();
  await scaleToken.initialize(scamm.address, '1', 'uUSD', 'uUSD', 18);

  console.log('yUSDA deployed to:', yUSDA.address);
  console.log('yUSDB deployed to:', yUSDB.address);
  console.log('yUSDC deployed to:', yUSDC.address);
  console.log('SCAMM deployed to:', scamm.address);
  console.log('ScaleToken deployed to:', scaleToken.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

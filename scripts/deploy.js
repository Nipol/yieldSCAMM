async function main() {
  const StandardTokenTemplate = await ethers.getContractFactory('StandardToken');
  const ScaleTokenTemplate = await ethers.getContractFactory('ScaleToken');
  const SCAMMTemplate = await ethers.getContractFactory('SCAMM');

  // 1. Token 배포
  // 0xaa13a4C86C410f97756fE0d76d07FB644feB2799
  const scaleToken = await ScaleTokenTemplate.deploy();
  await scaleToken.deployed();
  // 0x2f2d1790ae082d1847e9c4eefb58bd311f6ff886
  // const yUSDA = await StandardTokenTemplate.deploy();
  // await yUSDA.deployed();
  // 0xca529bd64d95d56615e3aecbf3aeb1be899a5090
  // const yUSDB = await StandardTokenTemplate.deploy();
  // await yUSDB.deployed();
  // 0x8bf346384ae2232077ccb596c48b8b934aa4177a
  // const yUSDC = await StandardTokenTemplate.deploy();
  // await yUSDC.deployed();
  // await yUSDA.initialize('0x2e6bE9855A3bF02C73Ba74B7d756a63DB7762238', '1', 'yUSDA', 'yUSDA', 18);
  // await yUSDB.initialize('0x2e6bE9855A3bF02C73Ba74B7d756a63DB7762238', '1', 'yUSDB', 'yUSDB', 18);
  // await yUSDC.initialize('0x2e6bE9855A3bF02C73Ba74B7d756a63DB7762238', '1', 'yUSDC', 'yUSDC', 18);

  // 2. SCAMM 배포
  const scamm = await SCAMMTemplate.deploy(
    '0x2e6bE9855A3bF02C73Ba74B7d756a63DB7762238',
    scaleToken.address,
    [
      '0x2f2d1790ae082d1847e9c4eefb58bd311f6ff886',
      '0xca529bd64d95d56615e3aecbf3aeb1be899a5090',
      '0x8bf346384ae2232077ccb596c48b8b934aa4177a',
    ],
    50, // 0.5%
  );
  await scamm.deployed();
  await scaleToken.initialize(scamm.address, '1', 'uUSD', 'uUSD', 18);

  console.log('yUSDA deployed to:', '0x2f2d1790ae082d1847e9c4eefb58bd311f6ff886');
  console.log('yUSDB deployed to:', '0xca529bd64d95d56615e3aecbf3aeb1be899a5090');
  console.log('yUSDC deployed to:', '0x8bf346384ae2232077ccb596c48b8b934aa4177a');
  console.log('SCAMM deployed to:', scamm.address);
  console.log('ScaleToken deployed to:', scaleToken.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

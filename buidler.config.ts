import { task, usePlugin } from '@nomiclabs/buidler/config';

usePlugin('@nomiclabs/buidler-waffle');
usePlugin('@nomiclabs/buidler-solhint');
usePlugin('buidler-ethers-v5');
usePlugin('@nomiclabs/buidler-ganache');
usePlugin('solidity-coverage');

// This is a sample Buidler task. To learn how to create your own go to
// https://buidler.dev/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, bre) => {
  const accounts = await bre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.getAddress());
  }
});

export default {
  defaultNetwork: 'buidlerevm',
  networks: {
    buidlerevm: {
      gas: 12000000,
      blockGasLimit: 12000000,
    },
    coverage: {
      url: 'http://localhost:8555',
    },
    //   rinkeby: {
    //     url: "https://rinkeby.infura.io/v3/123abc123abc123abc123abc123abcde",
    //     accounts: [privateKey1, privateKey2, ...]
    //   }
  },
  solc: {
    version: '0.6.12',
    optimizer: {
      enabled: true,
      runs: 99999999,
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 1,
  },
};

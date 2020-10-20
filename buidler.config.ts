import { task, usePlugin } from '@nomiclabs/buidler/config';

usePlugin('@nomiclabs/buidler-waffle');
usePlugin('@nomiclabs/buidler-solhint');
// usePlugin('@nomiclabs/buidler-ganache');
usePlugin('buidler-ethers-v5');
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
      gas: 9000000,
      blockGasLimit: 12000000,
    },
    coverage: {
      url: 'http://localhost:8555',
    },
    rinkeby: {
      url: "https://1edceef03e4f4369851b642651d48baf.rinkeby.rpc.rivet.cloud/",
      accounts: ['pk1'],
      gasPrice: 8000000000,
      timeout: 500000
    }
  },
  solc: {
    version: '0.6.12',
    optimizer: {
      enabled: true,
      runs: 9999999,
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

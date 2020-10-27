import { task } from "hardhat/config";
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-solhint';

import 'solidity-coverage';

// This is a sample Buidler task. To learn how to create your own go to
// https://buidler.dev/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.getAddress());
  }
});

export default {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      gas: 9000000,
      blockGasLimit: 12000000,
    },
    coverage: {
      url: 'http://localhost:8555',
    },
    // rinkeby: {
    //   url: "https://1edceef03e4f4369851b642651d48baf.rinkeby.rpc.rivet.cloud/",
    //   accounts: ['pk1'],
    //   gasPrice: 8000000000,
    //   timeout: 500000
    // }
  },
  solidity: {
    version: '0.6.12',
    settings: {
      optimizer: {
        enabled: true,
        runs: 9999999,
      }
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

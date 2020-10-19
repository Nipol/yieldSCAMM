import { Inject, Injectable, Optional } from '@angular/core';
import { Subject } from 'rxjs';
declare let require: any;
const Web3 = require('web3');

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  public web3: any;
  public account: string;
  public ready = false;

  public accountObservable = new Subject<string>();

  constructor() {
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });
  }

  bootstrapWeb3(): void {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.ethereum !== 'undefined') {
      // Use Mist/MetaMask's provider
      window.ethereum.enable().then(() => {
        this.web3 = new Web3(window.ethereum);
      });
    } else {
      console.log('No web3? You should consider trying MetaMask!');

      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }

    setInterval(() => this.refreshAccount(), 1000);
  }

  private async refreshAccount(): Promise<void> {
    const accs = await this.web3.eth.getAccounts();
    console.log('Refreshing accounts');

    // Get the initial account balance so it can be displayed.
    if (accs.length === 0) {
      console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
      return;
    }

    if (!this.account || this.account.length !== accs.length || this.account[0] !== accs[0]) {
      console.log('Observed new accounts');

      this.accountObservable.next(accs[0]);
      this.account = accs[0];
    }

    this.ready = true;
  }

  async makeContract(abis: any, address: string): Promise<any> {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.makeContract(abis, address);
    }

    const instance = new this.web3.eth.Contract(abis, address, {from: this.account});
    return instance;
  }

  // async artifactsToContract(artifacts) {
  //   if (!this.web3) {
  //     const delay = new Promise(resolve => setTimeout(resolve, 100));
  //     await delay;
  //     return await this.artifactsToContract(artifacts);
  //   }

  //   const contractAbstraction = contract(artifacts);
  //   contractAbstraction.setProvider(this.web3.currentProvider);
  //   return contractAbstraction;
  // }
}

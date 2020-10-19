import { Inject, Injectable, Optional } from '@angular/core';
import { ethers, Contract, Signer, providers } from 'ethers';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  provider: providers.Web3Provider;
  signer: Signer;
  contract: Contract;

  constructor(
    @Inject('address') @Optional() private address: string,
    @Inject('abis') @Optional() private abis: string[]
  ) {}

  connectWallet(): void {
    this.provider = new ethers.providers.Web3Provider((window as any).ethereum);
    this.signer = this.provider.getSigner();
    this.contract = new ethers.Contract(this.address, this.abis, this.provider);
  }

  Contract(): Contract {
    const contractWithSigner = this.contract.connect(this.signer);
    return contractWithSigner;
  }

  isConnected(): boolean {
    return this.provider ? true : false;
  }

  async getNetwork(): Promise<number> {
    return await this.signer.getChainId();
  }

  async getAddress(): Promise<string> {
    return await this.signer.getAddress();
  }
}

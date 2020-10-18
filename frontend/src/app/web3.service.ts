import { Inject, Injectable, Optional } from '@angular/core';
import { ethers } from 'ethers';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  provider;
  signer;
  contract;

  constructor(
    @Inject('address') @Optional() private address: string,
    @Inject('abis') @Optional() private abis: string[]
  ) {}

  connectWallet() {
    this.provider = new ethers.providers.Web3Provider((window as any).ethereum);
    this.signer = this.provider.getSigner();
    this.contract = new ethers.Contract(this.address, this.abis, this.provider);
  }

  tx() {
    const contractWithSigner = this.contract.connect(this.signer);
    return contractWithSigner;
  }
}

import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Web3Service } from '../web3.service';
import * as BN from 'bn.js';

@Component({
  selector: 'ysc-mint',
  templateUrl: './mint.component.html',
  styleUrls: ['./mint.component.scss']
})
export class MintComponent implements OnInit {
  yUSDA: any;
  yUSDABalance: string;
  yUSDAAmount: string;
  yUSDB: any;
  yUSDBBalance: string;
  yUSDBAmount: string;
  yUSDC: any;
  yUSDCBalance: string;
  yUSDCAmount: string;

  allowed: boolean;

  SCAMM: any;
  constructor(private web3: Web3Service) {}

  async ngOnInit(): Promise<void> {
    this.SCAMM = await this.web3.makeContract(environment.SCAMMAbis, environment.SCAMMAddress);
    this.yUSDA = await this.web3.makeContract(environment.ERC20Abis, environment.yUSDAAddress);
    this.yUSDB = await this.web3.makeContract(environment.ERC20Abis, environment.yUSDBAddress);
    this.yUSDC = await this.web3.makeContract(environment.ERC20Abis, environment.yUSDCAddress);

    setInterval(() => this.refreshBalance(), 1000);
  }

  async refreshBalance(): Promise<void> {
    const yUSDABalance = await this.yUSDA.methods.balanceOf(this.web3.account).call();
    this.yUSDABalance = new BN(yUSDABalance).div(new BN('1000000000000000000')).toString();
    const yUSDBBalance = await this.yUSDB.methods.balanceOf(this.web3.account).call();
    this.yUSDBBalance = new BN(yUSDBBalance).div(new BN('1000000000000000000')).toString();
    const yUSDCBalance = await this.yUSDC.methods.balanceOf(this.web3.account).call();
    this.yUSDCBalance = new BN(yUSDCBalance).div(new BN('1000000000000000000')).toString();
    const allowance = await this.yUSDC.methods.allowance(this.web3.account, environment.SCAMMAddress).call();
    this.allowed = allowance.length > 26;
  }

  isConnected(): boolean {
    return this.web3.ready;
  }

  getyUSDAAmount(amount: string): void {
    this.yUSDAAmount = new BN(amount).mul(new BN('1000000000000000000')).toString();;
  }

  getyUSDBAmount(amount: string): void {
    this.yUSDBAmount = new BN(amount).mul(new BN('1000000000000000000')).toString();;
  }

  getyUSDCAmount(amount: string): void {
    this.yUSDCAmount = new BN(amount).mul(new BN('1000000000000000000')).toString();;
  }

  deposit(): void {
    this.SCAMM.methods.deposit(
      [environment.yUSDAAddress, environment.yUSDBAddress, environment.yUSDCAddress],
      [this.yUSDAAmount, this.yUSDBAmount, this.yUSDCAmount]).send();
  }

  async approve(): Promise<void> {
    await this.yUSDA.methods.approve(environment.SCAMMAddress, '9999999999999999999999999999').send();
    await this.yUSDB.methods.approve(environment.SCAMMAddress, '9999999999999999999999999999').send();
    await this.yUSDC.methods.approve(environment.SCAMMAddress, '9999999999999999999999999999').send();
  }
}

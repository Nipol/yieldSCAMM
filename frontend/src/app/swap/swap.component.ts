import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Web3Service } from '../web3.service';

@Component({
  selector: 'ysc-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.scss']
})
export class SwapComponent implements OnInit {

  Header: string;
  SCAMM: any
  InContract: any;
  InBalance: string;
  OutContract: any;
  OutBalance: string;
  allowed: boolean;

  AmountIn: string;
  AmountOut: string;

  constructor(private web3: Web3Service, private route: Router) { }

  async ngOnInit(): Promise<void> {

    const token = this.route.url;
    switch (token) {
      case '/swapab':
        this.Header = 'Swap A to B';
        this.InContract = await this.web3.makeContract(environment.ERC20Abis, environment.yUSDAAddress);
        this.OutContract = await this.web3.makeContract(environment.ERC20Abis, environment.yUSDBAddress);
        break;

      case '/swapbc':
        this.Header = 'Swap B to C';
        this.InContract = await this.web3.makeContract(environment.ERC20Abis, environment.yUSDBAddress);
        this.OutContract = await this.web3.makeContract(environment.ERC20Abis, environment.yUSDCAddress);
        break;

      case '/swapca':
        this.Header = 'Swap C to A';
        this.InContract = await this.web3.makeContract(environment.ERC20Abis, environment.yUSDCAddress);
        this.OutContract = await this.web3.makeContract(environment.ERC20Abis, environment.yUSDAAddress);
        break;
    }
    this.SCAMM = await this.web3.makeContract(environment.SCAMMAbis, environment.SCAMMAddress);

    await this.refreshBalance();
  }

  async refreshBalance(): Promise<void> {
    this.InBalance = await this.InContract.methods.balanceOf(this.web3.account).call();
    this.OutBalance = await this.OutContract.methods.balanceOf(this.web3.account).call();
    const allowance = await this.InContract.methods.allowance(this.web3.account, environment.SCAMMAddress).call();
    this.allowed = allowance.length > 26;

    console.log(this.AmountIn?.length);
    if (this.AmountIn?.length > 0) {
      const inaddress = this.InContract._address;
      this.AmountOut = await this.SCAMM.methods.getAmountOut(inaddress, this.AmountIn);
      console.log(this.AmountOut);
    }
  }

  async approve(): Promise<void> {
    await this.InContract.methods.approve(environment.SCAMMAddress, '9999999999999999999999999999').send();
  }

  getInAmount(amount: string): void {
    this.AmountIn = amount;
  }

  async swap(): Promise<void> {

  }

  isConnected(): boolean {
    return this.web3.ready;
  }
}

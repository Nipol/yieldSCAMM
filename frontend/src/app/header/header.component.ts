import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../web3.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'ysc-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  account: string;
  ScaleToken: any;
  ScaleTokenBalance: string;

  constructor(private web3: Web3Service) {}

  async ngOnInit(): Promise<void> {
    this.watchAccount();
  }

  watchAccount(): void {
    this.web3.accountObservable.subscribe(async (account) => {
      this.account = `${account.slice(0, 6)}...${account.slice(20, 24)}`;
      await this.refreshBalance();
    });
  }

  async refreshBalance(): Promise<void> {
    this.ScaleToken = await this.web3.makeContract(environment.ERC20Abis, environment.ScaleTokenAddress);
    const ScaleTokenBalance = await this.ScaleToken.methods.balanceOf(this.web3.account).call();
    this.ScaleTokenBalance = `${ScaleTokenBalance.slice(0, ScaleTokenBalance.length - 18)}.${ScaleTokenBalance.slice(-18)}`;
  }

  isConnected(): boolean {
    return this.web3.ready;
  }
}

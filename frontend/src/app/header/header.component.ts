import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../web3.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'ysc-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [
    Web3Service,
    { provide: 'address', useValue: environment.ScaleTokenAddress },
    { provide: 'abis', useValue: environment.ScaleTokenAbis },
  ]
})
export class HeaderComponent implements OnInit {

  address: string;

  constructor(private web3: Web3Service) { }

  ngOnInit(): void {
  }

  async connectWallet(): Promise<void> {
    this.web3.connectWallet();
  }

  isConnected(): boolean {
    return this.web3.isConnected();
  }

}

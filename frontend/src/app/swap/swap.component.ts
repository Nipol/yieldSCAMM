import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Web3Service } from '../web3.service';

@Component({
  selector: 'ysc-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.scss'],
  providers: [
    Web3Service,
    { provide: 'address', useValue: environment.SCAMMAddress },
    { provide: 'abis', useValue: environment.SCAMMAbis },
  ]
})
export class SwapComponent implements OnInit {

  constructor(private web3: Web3Service) { }

  ngOnInit(): void {
  }

}

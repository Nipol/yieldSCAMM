import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ysc-btn',
  templateUrl: './btn.component.html',
  styleUrls: ['./btn.component.scss']
})
export class BtnComponent implements OnInit {

  @Output() clicked = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  onClick(event: any): void {
    this.clicked.emit(true);
  }

}

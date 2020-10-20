import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ysc-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('label') label: string;
  // tslint:disable-next-line: no-input-rename
  @Input('balance') balance: string;
  // tslint:disable-next-line: no-input-rename
  @Input('connect') connected: boolean;

  @Output() value = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  onKeyup(event: any): void {
    this.value.emit(event.target.value);
  }

}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddliquidityComponent } from './addliquidity.component';

describe('AddliquidityComponent', () => {
  let component: AddliquidityComponent;
  let fixture: ComponentFixture<AddliquidityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddliquidityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddliquidityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

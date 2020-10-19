import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SwapComponent } from './swap/swap.component';
import { MintComponent } from './mint/mint.component';

const routes: Routes = [
  {
    path: 'swapab',
    component: SwapComponent,
  },
  {
    path: 'swapbc',
    component: SwapComponent,
  },
  {
    path: 'swapca',
    component: SwapComponent,
  },
  {
    path: 'mint',
    component: MintComponent
  },
  { path: '', redirectTo: '/swapab', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

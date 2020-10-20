import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { BtnComponent } from './btn/btn.component';
import { SwapComponent } from './swap/swap.component';
import { TextComponent } from './text/text.component';
import { MintComponent } from './mint/mint.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    BtnComponent,
    SwapComponent,
    TextComponent,
    MintComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

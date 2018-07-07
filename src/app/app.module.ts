import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from "@angular/http";

import { AppComponent } from './app.component';
import {AppRoutingModule} from './app.routing';

import { ProductPageComponent } from './components/product-page/product-page.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CartComponent } from './components/cart/cart.component';

import { ProductService} from "./services/product.service";
import { CartService} from "./services/cart.service";
import { LocalStorageServie, StorageService } from "./services/storage.service";

@NgModule({
  declarations: [
    AppComponent,
    ProductPageComponent,
    HeaderComponent,
    FooterComponent,
    CartComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [
    ProductService,
    CartService,
    LocalStorageServie,
    { provide: StorageService, useClass: LocalStorageServie },
    {provide: CartService, useClass: CartService}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { ChangeDetectionStrategy,Component, OnInit } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";

import {Product} from '../../models/product.model';
import{Cart} from '../../models/cart.model';

import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  // changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css']
})
export class ProductPageComponent implements OnInit {
  public products: Product[];
  constructor(private productService:ProductService,private cartService: CartService) { }

  ngOnInit() {
    // this.products = this.productService.allProducts();
    this.productService.allProducts().subscribe((products:Product[]) => {
      this.products=products;
    });
  }
  
  addToCart(product:Product):void{
    this.cartService.addItem(product, 1);
  }

}

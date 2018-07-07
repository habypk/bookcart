import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";


import { Product } from '../../models/product.model';
import { Cart } from '../../models/cart.model';
import { CartItem } from '../../models/cart-item.model';


import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

interface CartItemWithProduct extends CartItem {
  product: Product;
  totalCost: number;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {

  public products: Observable<Product[]>;
  public cart: Observable<Cart>;
  public cartItems: CartItemWithProduct[];
  public itemCount: number;

  private productsCart: Product[];

  private cartSubscription: Subscription;


  constructor(private productsService: ProductService, private cartService: CartService) {

  }

  ngOnInit(): void {
    this.products = this.productsService.allProducts()
    this.cart = this.cartService.get();
    this.cartSubscription = this.cart.subscribe((cart) => {
      this.itemCount = cart.items.map((x) => x.quantity).reduce((p, n) => p + n, 0);
      this.productsService.allProducts().subscribe((products) => {
        this.productsCart = products;
        this.cartItems = cart.items.map((item) => {
          const product = this.productsCart.find((p) => p.id === item.productId);
          return {
            ...item,
            product,
            totalCost: product.price * item.quantity
          };
        });
      });
    });
  }
  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
  public emptyCart(): void {
    this.cartService.empty();
  }

}

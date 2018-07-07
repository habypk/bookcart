import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";

import { Product } from '../models/product.model';
import { CartItem } from '../models/cart-item.model';
import { Cart } from '../models/cart.model';

import { ProductService } from '../services/product.service';
import { StorageService } from "../services/storage.service";

const CART_KEY = "cart";

@Injectable()
export class CartService {
  private storage: Storage;
  private subscriptionObservable: Observable<Cart>;
  private subscribers: Array<Observer<Cart>> = new Array<Observer<Cart>>();
  private products: Product[];
  
  private booksGroup:number[][];
  private groupCount:number=0;

  constructor(private storageService: StorageService, private productService: ProductService) {
    this.storage = this.storageService.get();
    this.productService.allProducts().subscribe((products) => this.products = products);
    this.subscriptionObservable = new Observable<Cart>((observer: Observer<Cart>) => {
      this.subscribers.push(observer);
      observer.next(this.retrieve());
      return () => {
        this.subscribers = this.subscribers.filter((obs) => obs !== observer);
      };
    });
  }

  public get(): Observable<Cart> {
    return this.subscriptionObservable;
  }

  public addItem(product: Product, quantity: number): void {
    const cart = this.retrieve();
    let item = cart.items.find((p) => p.productId === product.id);
    if (item === undefined) {
      item = new CartItem();
      item.productId = product.id;
      cart.items.push(item);
    }
    item.quantity += quantity;
    cart.items = cart.items.filter((cartItem) => cartItem.quantity > 0);

    this.calculateCart(cart);
    this.calculateDiscount(cart);
    this.save(cart);
    this.dispatch(cart);
    // console.log(cart);
  }

  private calculateDiscount(cart: Cart): void {
      // console.log(cart.items.length);
      // cart.items.map((x) => x.quantity).reduce((p, n) => p + n, 0);
      let bookArray =cart.items.map((x) => x.quantity);
      let totalDeferentBook :number = cart.items.length;
      let discountPercent :number =0;
      // if(totalDeferentBook ==2){
      //   discountPercent =5;
      // }else if(totalDeferentBook==3){
      //   discountPercent =10;
      // }else if(totalDeferentBook == 4){
      //   discountPercent =20;
      // }else if(totalDeferentBook == 5){
      //   discountPercent =25;
      // }
      this.groupingCart(bookArray);
  }

  private groupingCart(bookArray){
    // console.log(bookArray[1]);
    console.log(bookArray);
    for (let entry of bookArray) {
      console.log("a"+entry);
    }
  }

  public empty(): void {
    const newCart = new Cart();
    this.save(newCart);
    this.dispatch(newCart);
  }

  private save(cart: Cart): void {
    this.storage.setItem(CART_KEY, JSON.stringify(cart));
  }

  private calculateCart(cart: Cart): void {
    //calculate cart item
    cart.itemsTotal = cart.items
      .map((item) => item.quantity * this.products.find((p) => p.id === item.productId).price)
      .reduce((previous, current) => previous + current, 0);
   
    //calculate grosstotal
    cart.grossTotal = cart.itemsTotal - cart.discountTotal ;
    // console.log(cart.discountTotal);
  }
  private retrieve(): Cart {
    const cart = new Cart();
    const storedCart = this.storage.getItem(CART_KEY);
    if (storedCart) {
      cart.updateFrom(JSON.parse(storedCart));
    }

    return cart;
  }
  private dispatch(cart: Cart): void {
    this.subscribers
        .forEach((sub) => {
          try {
            sub.next(cart);
          } catch (e) {
            // we want all subscribers to get the update even if one errors.
          }
        });
  }
}

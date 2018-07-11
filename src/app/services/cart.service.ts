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

  private booksGroup: number[][];
  private groupCount: number = 0;
  private discountGroup: number[];
  private arr = new Array();

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
    let bookArray = cart.items.map((x) => x.quantity);
    let totalDeferentBook: number = cart.items.length;
    let discountPercent: number = 0;
    let discountedPrice: number = 0;
    let totalBooks = cart.items.map((x) => x.quantity).reduce((p, n) => p + n, 0);
    let finalSet = [];


    //console.log(bookArray);
    if (this.checkMoreBook(bookArray)) {
      //console.log('More');
      //get MaxCount in a group
      let maxCountinSingle = this.getMaxCount(bookArray);
      let totalElements = 5 * maxCountinSingle; // get total element array
      let arrayInitial = [];
      for (let i = 0; i < totalElements; i++) {
        if (i < totalBooks) {
          arrayInitial.push(1);
        } else {
          arrayInitial.push(0);
        }
      }

      for (let i = 0; i < 1000; i++) {
        let arrTemp = this.randArrayGeneration(bookArray, maxCountinSingle);
        if (!this.rejectArray(bookArray, arrTemp, maxCountinSingle)) {
          finalSet.push(arrTemp);
        }
      }
      
      // console.log(finalSet);
      let finalPrice=[];
      finalSet.forEach((value,index)=>{
         let singleFinalPrice = this.calculatePrice(value,maxCountinSingle);
         finalPrice.push(singleFinalPrice);
      });

      //console.log(finalPrice);
      discountedPrice = Math.min.apply(null, finalPrice);
      //console.log(minDiscountPrice);
      //permute the arrayinitial
      //this.arr = [];
      // this.heapsPermute(arrayInitial);
      //this.heapsPermute([1,1,1,0]);
      //console.log(this.arr);

    } else {
      discountedPrice = this.priceOnlyOnebook(bookArray, totalDeferentBook, totalBooks);
    }
    //Check any book contains more than one book
    //console.log(discountedPrice);

    cart.grossTotal = discountedPrice;

  }

  private calculatePrice(arrSingle,maxCountinSingle){
    //console.log(arrSingle);
    let discountPrice :number =0;
    arrSingle.forEach((value,index)=>{
      let totalCount =0;
      for(let i=0;i<5;i++){
        if(value[i]== 1 ){
          totalCount++;
        }
      }

      if(totalCount==1){
        discountPrice += 8;
      }
      else if(totalCount==2){
        discountPrice += 2 *(8 - 0.4) ;
      }else if(totalCount==3){
        discountPrice += 3 * (8 - 0.8) ;
      }else if(totalCount==4){
        discountPrice += 4 *(8 - 1.6) ;
      }else if(totalCount==5){
        discountPrice += 5 *(8 - 2) ;
      }

      
    });


    
    return discountPrice;
  }

  private rejectArray(bookArray, arrTemp, maxCountinSingle) {
    let rejectArray = false;
    bookArray.forEach((item, index) => {
      let totEle = item;
      let totVal = 0;
      for (let i = 0; i < maxCountinSingle; i++) {
        totVal += arrTemp[i][index];
      }
      if (totEle != totVal) {
        rejectArray = true;
      }

    });
    return rejectArray;
  }
  private randArrayGeneration(bookArray, maxCountinSingle) {
    let arrInt = [];
    for (let i = 0; i < maxCountinSingle; i++) {
      let arrTemp = [];
      for (let j = 0; j < 5; j++) {
        let insVal: number = 0;
        //
        if (bookArray[j] != undefined) {
          //console.log(i + '---' + j + '-----' + bookArray[j] + '---' + maxCountinSingle);
          if (bookArray[j] == maxCountinSingle) {
            insVal = 1;
          } else {
            insVal = Math.round(Math.random());
          }
        } else {
          insVal = 0;
        }
        arrTemp[j] = insVal;

      }
      arrInt[i] = arrTemp;

    }
    return arrInt;
  }

  private swap(array, pos1, pos2) {
    var temp = array[pos1];
    array[pos1] = array[pos2];
    array[pos2] = temp;
  };

  private heapsPermute(array, n?) {
    n = n || array.length;
    if (n === 1) {
      this.arr.push(array);
      // slit the array in to max number

      //check the count in each with orginal array

      //if equal push other wise omit

    } else {
      for (var i = 1; i <= n; i += 1) {
        this.heapsPermute(array, n - 1);
        if (n % 2) {
          var j = 1;
        } else {
          var j = i;
        }
        this.swap(array, j - 1, n - 1);
      }
    }
  };



  private getMaxCount(bookArray) {
    let maxCount: number = 0;
    bookArray.forEach(function (value) {
      maxCount = value > maxCount ? value : maxCount;
    });
    return maxCount;
  }

  private priceOnlyOnebook(bookArray, totalDeferentBook, totalBooks) {
    let priceForOnebook: number = 8;
    if (totalBooks == 1) {
      return priceForOnebook;
    } else if (totalBooks == 2) {
      return totalBooks * (priceForOnebook - 0.4);
    }
    else if (totalBooks == 3) {
      return totalBooks * (priceForOnebook - 0.8);
    } else if (totalBooks == 4) {
      return totalBooks * (priceForOnebook - 1.6);
    } else {
      return totalBooks * (priceForOnebook - 2);
    }
  }

  private checkMoreBook(bookArray) {
    let moreBook: boolean = false;
    bookArray.forEach(function (value) {
      // console.log(value);
      if (value > 1) {
        moreBook = true;
      }
    });

    return moreBook;
  }

  // private groupingCart(bookArray,totalDeferentBook){

  // }

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
    cart.grossTotal = cart.itemsTotal - cart.discountTotal;
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

import { Injectable } from '@angular/core';
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { Observable } from "rxjs/Observable";

import { Product} from '../models/product.model';

@Injectable()
export class ProductService {

  
  constructor(private http: Http) {
    
  }

  public allProducts(): Observable<Product[]>{
     return this.http.get('./assets/products.json').map((response) => response.json());
     
  }

}

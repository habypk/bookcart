import { CartItem } from '../models/cart-item.model';

export class Cart {
    public items: CartItem[] = new Array<CartItem>();
    public grossTotal: number = 0;
    public discountTotal: number = 0;
    public itemsTotal: number = 0;   
    
    public updateFrom(src: Cart) {
        this.items = src.items;
        this.grossTotal = src.grossTotal;
        this.discountTotal = src.discountTotal;
        this.itemsTotal = src.itemsTotal;
    } 
}
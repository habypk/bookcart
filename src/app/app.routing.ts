import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import {ProductPageComponent} from './components/product-page/product-page.component';

@NgModule({
    exports: [RouterModule],
    imports: [
        RouterModule.forRoot([
            {
                component: ProductPageComponent,
                path: "**"
            }])
    ]
})
export class AppRoutingModule { }
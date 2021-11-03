import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
//for home banner
import { BannerComponent } from '../banner/banner.component';
//for home footer segment

// for product
import { ProductComponent } from '../product/product.component';
//for sliding tab
import { SlidingTabsComponent } from '../sliding-tabs/sliding-tabs.component';
//for featrued product scrolling
import { ScrollingFeaturedProductsComponent } from '../scrolling-featured-products/scrolling-featured-products.component';
//for categories
import { CategoriesComponent } from '../categories/categories.component';
import { PipesModule } from 'src/pipes/pipes.module';
import { TimerComponent } from '../timer/timer.component';
import { GoogleMapComponent } from '../google-map/google-map.component';
import { NoCategoryFoundComponent } from '../no-category-found/no-category-found.component';
import { NoRecordFoundComponent } from '../no-record-found/no-record-found.component';




@NgModule({
  declarations: [
    BannerComponent,
    ProductComponent,
    SlidingTabsComponent,
    ScrollingFeaturedProductsComponent,
    CategoriesComponent,
    TimerComponent,
    GoogleMapComponent,
    NoCategoryFoundComponent,
    NoRecordFoundComponent
  ],
  exports: [
    BannerComponent,
    ProductComponent,
    SlidingTabsComponent,
    ScrollingFeaturedProductsComponent,
    CategoriesComponent,
    TimerComponent,
    GoogleMapComponent,
    NoCategoryFoundComponent,
    NoRecordFoundComponent
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PipesModule,
  ],
})
export class ShareModule { }

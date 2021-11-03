import { Component, OnInit, ApplicationRef } from '@angular/core';


import { ConfigService } from 'src/providers/config/config.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { NavController, ModalController, ActionSheetController } from '@ionic/angular';
import { LoadingService } from 'src/providers/loading/loading.service';
import { CouponService } from 'src/providers/coupon/coupon.service';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../modals/login/login.page';
import { AppEventsService } from 'src/providers/app-events/app-events.service';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  total: any;
  constructor(
    public navCtrl: NavController,
    public shared: SharedDataService,
    public config: ConfigService,
    public loading: LoadingService,
    private storage: Storage,
    public appEventsService: AppEventsService,
    public modalCtrl: ModalController,
    private applicationRef: ApplicationRef,
    public couponProvider: CouponService,
    public actionSheetCtrl: ActionSheetController,
  ) {
  }
  ngOnInit() {

  }
  totalPrice() {
    var price = 0;
    for (let value of this.shared.cartProducts) {
      var pp = value.final_price * value.customers_basket_quantity;
      price = price + pp;
    }
    this.total = price;
  };
  getSingleProductDetail(id) {
    this.loading.show();

    var dat: { [k: string]: any } = {};
    if (this.shared.customerData != null)
      dat.customers_id = this.shared.customerData.customers_id;
    else
      dat.customers_id = null;
    dat.products_id = id;
    dat.language_id = this.config.langId;
    dat.currency_code = this.config.currecnyCode;
    this.config.postHttp('getallproducts', dat).then((data: any) => {
      this.loading.hide();
      if (data.success == 1) {
        this.shared.singleProductPageData.push(data.product_data[0]);
        this.navCtrl.navigateForward(this.config.currentRoute + "/product-detail/" + data.product_data[0].products_id);
      }
    });
  }
  removeCart(id) {
    this.shared.removeCart(id);
    this.totalPrice();
  }
  qunatityPlus(q) {
    // if (q.customers_basket_quantity >= q.quantity) {
    //   this.shared.toast('Product Quantity is Limited!');
    //   return;
    // }
    q.customers_basket_quantity++;
    q.subtotal = q.final_price * q.customers_basket_quantity;
    q.total = q.subtotal;
    this.totalPrice();
    this.shared.cartTotalItems();
    this.storage.set('cartProducts', this.shared.cartProducts);
  }
  //function decreasing the quantity
  qunatityMinus = function (q) {
    if (q.customers_basket_quantity == 1) {
      return 0;
    }
    q.customers_basket_quantity--;
    q.subtotal = q.final_price * q.customers_basket_quantity;
    q.total = q.subtotal;
    this.totalPrice();

    this.shared.cartTotalItems();
    this.storage.set('cartProducts', this.shared.cartProducts);
  }

  async proceedToCheckOut() {
    this.navCtrl.navigateForward(this.config.currentRoute + "/shipping-address");
  }
  openProductsPage() {
    if (this.config.appNavigationTabs)
      this.navCtrl.navigateForward("tabs/" + this.config.getCurrentHomePage());
    else
      this.navCtrl.navigateForward(this.config.getCurrentHomePage());
  }
  ionViewWillEnter() {
    // this.shared.changeGuestCheckoutStatus(0);
    //this.navCtrl.navigateForward(this.config.currentRoute + "/order")
    this.getNewCartInfo();
    console.log("Cart is viewed");
    this.totalPrice()
  }
  //=====================================================
  getCartProductsIds() {
    let arr = [];
    this.shared.cartProducts.forEach(element => {
      arr.push(element.products_id);
    });
    return arr;
  }

  //=====================================================
  getNewCartInfo() {
    let newProducts = [];
    let count = 0;
    let oldProductsIds = this.getCartProductsIds();
    oldProductsIds.forEach(element => {
      this.loading.show();
      var dat: { [k: string]: any } = {};
      dat.products_id = element;
      dat.language_id = this.config.langId;
      dat.currency_code = this.config.currecnyCode;
      this.config.postHttp('getallproducts', dat).then((data: any) => {

        count++;

        if (data.success == 1) {
          newProducts.push(data.product_data[0]);
          //this.shared.cartProducts = data.product_data;
        }
        if (count == oldProductsIds.length) { this.loading.hide(); this.updateProductsInfo(newProducts); }
      });
    });
  }
  //================================================
  updateProductsInfo(array) {
    let tempArrayDeleteProductsOld = JSON.parse(JSON.stringify(this.shared.cartProducts));
    this.shared.cartProducts = [];
    array.forEach(newProduct => {
      if (newProduct.attributes.length == 0) {
        this.shared.addToCart(newProduct, []);
      }
      else {
        tempArrayDeleteProductsOld.forEach(oldProduct => {
          if (newProduct.products_id == oldProduct.products_id) {
            let newAtt = this.fillAttributes(oldProduct.attributes, newProduct.attributes);
            this.shared.addToCart(newProduct, newAtt);
          }
        });
      }
    });
    console.log(this.shared.cartProducts);
    tempArrayDeleteProductsOld.forEach(element => {
      this.shared.cartProducts.forEach(element2 => {
        if (element.products_id == element2.products_id) {
          element2.customers_basket_quantity = element.customers_basket_quantity;
          element2.subtotal = element2.final_price * element2.customers_basket_quantity;
          element2.total = element2.subtotal;
        }
      });
    });
  }

  //============================================================================================  
  //below code to get new attributes in the products 
  fillAttributes(oldAtts, newAtts) {
    let updatedAtts = [];
    console.log(oldAtts);
    console.log(newAtts);
    oldAtts.forEach(oldValue => {
      let newValueForUpdate: any = this.getNewValueInfo(oldValue, newAtts);
      let att = {
        products_options_id: oldValue.products_options_id,
        products_options: oldValue.products_options,
        products_options_values_id: newValueForUpdate.id,
        options_values_price: newValueForUpdate.price,
        price_prefix: newValueForUpdate.price_prefix,
        products_options_values: newValueForUpdate.value,
        attribute_id: newValueForUpdate.products_attributes_id,
        name: newValueForUpdate.value + ' ' + newValueForUpdate.price_prefix + newValueForUpdate.price + " " + this.config.currency
      }
      updatedAtts.push(att);
    });
    return updatedAtts;
  };
  //============================================
  getNewValueInfo(oldOption, newAtts) {
    let valueToReturn = {};
    newAtts.forEach(element => {
      console.log(element.option.id);
      console.log(element.option.id, oldOption.products_options_id);
      if (element.option.id == oldOption.products_options_id) {
        console.log(element.option.id, oldOption.products_options_id);
        element.values.forEach(element2 => {
          if (oldOption.attribute_id == element2.products_attributes_id) {
            valueToReturn = element2;
          }
        });
      }
    });
    console.log(valueToReturn);
    return valueToReturn;
  }

}

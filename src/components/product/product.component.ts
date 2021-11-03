import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { ConfigService } from 'src/providers/config/config.service';
import { LoadingService } from 'src/providers/loading/loading.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { Storage } from '@ionic/storage';
import { LoginPage } from 'src/app/modals/login/login.page';
import { AppEventsService } from 'src/providers/app-events/app-events.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CurencyPipe } from 'src/pipes/curency.pipe';
@Component({
  selector: 'app-product',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  providers: [CurencyPipe]
})
export class ProductComponent implements OnInit {

  @Input('data') p;//product data
  @Input('type') type;
  // @Output() someEvent = new EventEmitter();

  expired = false;
  is_upcomming = false;
  price_html = "";
  cartQuantity = 0;
  constructor(public config: ConfigService,
    public shared: SharedDataService,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public appEventsService: AppEventsService,
    private storage: Storage,
    public loading: LoadingService,
    private sanitizer: DomSanitizer,
    public curencyPipe: CurencyPipe
  ) {
    // flash_expires_date
    // flash_start_date
    // server_time

    let wishListUpdate = this.appEventsService.subscribe("wishListUpdate");
    wishListUpdate.subscriptions.add(wishListUpdate.event.subscribe(data => {

      if (this.p.products_id == data.id) this.p.isLiked = data.value
    }));

    let productExpired = this.appEventsService.subscribe("productExpired");
    productExpired.subscriptions.add(productExpired.event.subscribe(data => {
      let id = data;
      if (this.p.products_id == id) this.productExpired();
    }));
  }
  productExpired() {
    console.log("expired " + this.p.products_name);
    this.expired = true
  }

  pDiscount() {
    if (this.type != "flash") {
      var rtn = "";
      var p1 = parseInt(this.p.products_price);
      var p2 = parseInt(this.p.discount_price);
      if (p1 == 0 || p2 == null || p2 == undefined || p2 == 0) { rtn = ""; }
      var result = Math.abs((p1 - p2) / p1 * 100);
      result = parseInt(result.toString());
      if (result == 0) { rtn = "" }
      rtn = result + '%';
      return rtn;
    }
    else if (this.type == "flash") {
      var rtn = "";
      var p1 = parseInt(this.p.products_price);
      var p2 = parseInt(this.p.flash_price);
      if (p1 == 0 || p2 == null || p2 == undefined || p2 == 0) { rtn = ""; }
      var result = Math.abs((p1 - p2) / p1 * 100);
      result = parseInt(result.toString());
      if (result == 0) { rtn = "" }
      rtn = result + '%';
      return rtn;
    }
  }

  showProductDetail() {
    if (this.type == 'flash') {
      this.loading.show();
      var dat: { [k: string]: any } = {};
      if (this.shared.customerData != null)
        dat.customers_id = this.shared.customerData.customers_id;
      else
        dat.customers_id = null;

      dat.products_id = this.p.products_id;
      dat.language_id = this.config.langId;
      dat.currency_code = this.config.currecnyCode;
      dat.type = 'flashsale';
      this.config.postHttp('getallproducts', dat).then((data: any) => {
        this.loading.hide();
        if (data.success == 1) {
          this.shared.singleProductPageData.push(data.product_data[0]);
          this.navCtrl.navigateForward(this.config.currentRoute + "/product-detail/" + this.p.products_id);
        }
      }, err => {
        console.log(err);
      });
    }
    else {
      this.shared.singleProductPageData.push(this.p);
      this.navCtrl.navigateForward(this.config.currentRoute + "/product-detail/" + this.p.products_id);
    }

    if (this.type != 'recent' && this.type != 'flash') this.shared.addToRecent(this.p);
  }

  checkProductNew() {
    var pDate = new Date(this.p.products_date_added);
    var date = pDate.getTime() + this.config.newProductDuration * 86400000;
    var todayDate = new Date().getTime();
    if (date > todayDate)
      return true;
    else
      return false
  }

  addToCart() { this.shared.addToCart(this.p, []); }

  isInCart() {
    var found = false;

    for (let value of this.shared.cartProducts) {
      if (value.products_id == this.p.products_id) { found = true; }
    }

    if (found == true) return true;
    else return false;
  }
  removeRecent() {
    this.shared.removeRecent(this.p);

  }

  getProductImage() {
    return this.config.imgUrl + this.p.products_image;
  }

  getButtonText() {
    if (this.config.inventory == 0) {
      if (this.p.products_type == 0)
        return 'ADD TO CART';

      if (this.p.products_type != 0)
        return 'DETAILS';
    }
    else if (this.config.inventory == 1) {
      if (this.p.defaultStock > 0 && this.p.products_type == 0)
        return 'ADD TO CART';

      if (this.p.products_type != 0)
        return 'DETAILS';

      if (this.p.defaultStock <= 0 && this.p.products_type == 0)
        return 'OUT OF STOCK';
    }


  }

  buttonClick() {
    if (this.type == 'flash') this.showProductDetail();
    else if (this.getButtonText() == 'ADD TO CART') this.addToCart();
    else if (this.getButtonText() == 'DETAILS') this.showProductDetail();
    else if (this.getButtonText() == 'OUT OF STOCK') this.shared.toast("OUT OF STOCK");

  }

  getButtonColor() {
    if (this.getButtonText() == 'ADD TO CART') return 'secondary';
    else if (this.getButtonText() == 'DETAILS') return 'secondary';
    else if (this.getButtonText() == 'OUT OF STOCK') return 'danger';
  }

  getCategoryName() {
    if (this.p.categories.length != 0)
      return this.p.categories[0].categories_name;
  }

  removeProduct(type) {
    if (type == "recent") { this.removeRecent(); }
    else if (type == "wishList") { this.removeWishList(); }
  }
  async clickWishList() {

    if (this.shared.customerData.customers_id == null || this.shared.customerData.customers_id == undefined) {
      let modal = await this.modalCtrl.create({
        component: LoginPage,
        componentProps: {
          'hideGuestLogin': true
        }
      });
      await modal.present();
    }
    else {
      if (this.p.isLiked == '0') { this.addWishList(); }
      else this.removeWishList();
    }
  }
  addWishList() {
    this.shared.addWishList(this.p);
  }
  removeWishList() {
    this.shared.removeWishList(this.p);
  }

  getHeartName() {
    if (this.p.isLiked == '0') return "heart-outline";
    else return "heart";
  }

  getPriceHtml() {
    let r = ""
    let p = this.curencyPipe.transform(this.p.products_price);
    let pD = this.curencyPipe.transform(this.p.discount_price);

    if (this.type != 'flash') {
      if (this.p.discount_price == null) r += "<span class='card-price-normal ion-float-start'>" + p + "</span>"
      if (this.p.discount_price != null) r += "<span class='card-price-normal-through ion-float-start' > " + p + " </span>"
      if (this.p.discount_price != null) r += "<span class='card-price-normal ion-float-start' > " + pD + " </span>"

    }
    else if (this.type == 'flash') {
      let pF = this.curencyPipe.transform(this.p.flash_price);
      r += "<span class='card-price-normal-through ion-float-start' > " + p + " </span>"
      r += "<span class='card-price-normal ion-float-start' > " + pF + " </span>"
    }
    return r;
  }

  getRating() {
    return null;
  }
  getParsedRating() {
    return null;
  }
  ngOnInit() {
    if (this.type == 'flash') {
      if (this.p.server_time < this.p.flash_start_date) this.is_upcomming = true;
      //console.log("server time less than " + (this.p.server_time - this.p.flash_start_date));
    }

    this.price_html = this.getPriceHtml();
  }



  ngDoCheck() {
    this.shared.cartProducts.forEach(element => {
      if (element.products_id == this.p.products_id) {
        this.cartQuantity = element.customers_basket_quantity;
      }
    });
  }

  addingToCart() {
    if (this.getButtonText() == "ADD TO CART") {

      if (this.cartQuantity == 0) {
        this.addToCart();
      }
      else {
        this.shared.cartProducts.forEach(element => {
          if (element.products_id == this.p.products_id) {
            this.qunatityPlus(element);
          }
        });
      }

    }
    else {
      this.buttonClick();
    }
  }
  removingToCart() {
    this.shared.cartProducts.forEach(element => {
      if (element.products_id == this.p.products_id) {
        this.qunatityMinus(element);
      }
    });
  }
  //============================================================================================  
  qunatityPlus = function (q) {
    q.customers_basket_quantity++;
    q.subtotal = q.final_price * q.customers_basket_quantity;
    q.total = q.subtotal;
    if (q.quantity == null) return 0;
    if (q.customers_basket_quantity > q.quantity) {
      q.customers_basket_quantity--;
      q.subtotal = q.final_price * q.customers_basket_quantity;
      q.total = q.subtotal;
      this.shared.toast('Product Quantity is Limited!', 'short', 'center');
    }
  }
  //============================================================================================  
  //function decreasing the quantity
  qunatityMinus = function (q) {

    if (q.customers_basket_quantity == 1) {
      this.removeCartItem(q.cart_id);
      return 0;
    }
    q.customers_basket_quantity--;
    q.subtotal = q.final_price * q.customers_basket_quantity;
    q.total = q.subtotal;
  }

  removeCartItem(id) {
    this.shared.removeCart(id);
    this.cartQuantity = 0;
  }

  updateCart() {
    this.shared.removeCart(this.shared.cartProducts);
  }

  ratingPercentage() {
    return this.shared.getProductRatingPercentage(this.p.rating);
  }
}

import { Component, OnInit, ApplicationRef, ViewEncapsulation } from '@angular/core';
import { NavController, ModalController, } from '@ionic/angular';
import { ConfigService } from 'src/providers/config/config.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { LoadingService } from 'src/providers/loading/loading.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';


import { HttpClient } from '@angular/common/http';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Storage } from '@ionic/storage';
import { ActivatedRoute, Router } from '@angular/router';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { LoginPage } from '../modals/login/login.page';
import { AppEventsService } from 'src/providers/app-events/app-events.service';

@Component({
  selector: 'app-product-detail',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {

  public product: { [k: string]: any } = {};
  attributes = [];
  selectAttribute = true;
  discount_price;
  flash_price;
  product_price;
  current_price;
  cartButton = "addToCart";
  is_upcomming = false;
  public isLiked = 0;
  public wishArray = [];
  public disableCartButton = false;
  public variations = new Array;
  public groupProducts = new Array;
  public variationPrice = null;
  public loaderWcVendorInfo = false;
  public wcVendorInfo: any;
  public loaderProductVariations = false;
  pId: any;
  sliderConfigReleatedItems = {
    slidesPerView: this.config.productSlidesPerPage,
    spaceBetween: 0
  }
  sliderConfig = {
    zoom: true
  }

  ratingStarsValue = 1;

  constructor(
    public navCtrl: NavController,
    public config: ConfigService,
    public shared: SharedDataService,
    public modalCtrl: ModalController,
    public loading: LoadingService,
    public iab: InAppBrowser,
    public appEventsService: AppEventsService,
    private storage: Storage,
    private photoViewer: PhotoViewer,
    private socialSharing: SocialSharing,
    private activatedRoute: ActivatedRoute,
    private router: Router) {

    this.pId = this.activatedRoute.snapshot.paramMap.get('id');
    this.product = JSON.parse(JSON.stringify(this.getProductData(this.pId)));
    this.product.cartQuantity = 1;
    // console.log(this.product);
    this.discount_price = this.product.discount_price;
    this.product_price = this.product.products_price;
    this.flash_price = this.product.flash_price;

    if (this.product.discount_price == null)
      this.current_price = this.product.products_price;
    if (this.product.discount_price != null)
      this.current_price = this.product.discount_price;
    if (this.product.flash_start_date)
      this.current_price = this.product.flash_price;

    if (this.config.inventory == 1) {
      if (this.product.products_type == 0 && this.product.defaultStock <= 0) this.cartButton = "outOfStock";
      if (this.product.products_type == 1) this.cartButton = "addToCart";
      if (this.product.products_type == 2) this.cartButton = "external";
    }

    if (this.product.attributes != null && this.product.attributes != undefined && this.product.attributes.length != 0) {
      //this.selectAttribute = this.product.attributes[0].values[0];
      // console.log(this.selectAttribute);
      this.product.attributes.forEach((value, index) => {

        var att = {
          products_options_id: value.option.id,
          products_options: value.option.name,
          products_options_values_id: value.values[0].id,
          options_values_price: value.values[0].price,
          price_prefix: value.values[0].price_prefix,
          products_options_values: value.values[0].value,
          attribute_id: value.values[0].products_attributes_id,
          name: value.values[0].value + ' ' + value.values[0].price_prefix + value.values[0].price + " " + this.config.currency
        };
        value.name = value.values[0];
        this.attributes.push(att);
      });
      this.checkAvailability();
      console.log(this.attributes);
    }
  }

  //============================================================================================  
  qunatityPlus(q) {
    this.product.cartQuantity++;
    if (this.product.products_max_stock == null) return 0;
    if (this.product.cartQuantity > q.products_max_stock) {
      this.product.cartQuantity--;
      this.shared.toast('Product Quantity is Limited!');
    }
  }
  //============================================================================================  
  //function decreasing the quantity
  qunatityMinus(q) {
    if (this.product.cartQuantity == 1) {
      return 0;
    }
    this.product.cartQuantity--;
  }

  quantityChange() {
    if (this.product.products_max_stock == null) { console.log("quantity is unlimited"); }
    else if (this.product.cartQuantity > this.product.products_max_stock) { console.log("quantity is less than stock quantity"); }
    else if (this.product.cartQuantity < this.product.products_max_stock) {
      this.shared.translateString("Product Quantity is Limited!").then((res) => {
        if (this.product.cartQuantity == null)
          this.product.cartQuantity = 1;
        else
          this.product.cartQuantity = parseInt(this.product.cartQuantity);
        this.shared.showAlert(res);
      })
    }
    if (this.product.cartQuantity == null || this.product.cartQuantity == 0 || this.product.cartQuantity < 0) {
      this.product.cartQuantity = 1;
    }
  }

  zoomImage(img) {
    this.photoViewer.show(img);
  }
  getProductData(id) {
    let p;
    this.shared.singleProductPageData.forEach(element => {
      if (element.products_id == id) {
        p = element;
      }
    });
    return p;
  }
  checkAvailability() {
    if (this.config.inventory == 0) {
      this.cartButton = "addToCart"
      return;
    }
    this.loading.show();
    let att = [];
    for (let a of this.attributes) {
      att.push(a.attribute_id.toString());
    }

    let data = {
      products_id: this.product.products_id.toString(),
      attributes: att
    };

    this.config.postHttp('getquantity', data).then((data: any) => {
      this.loading.hide();
      if (data.success == 1) {
        if (data.stock > 0) {
          this.cartButton = "addToCart"
        }
        else {
          this.cartButton = "outOfStock"
          this.shared.toast("Product Not Available With these Attributes!");
        }
        console.log(data.stock);

      }
    }, error => {
      this.loading.hide();
    });
  }
  openProductUrl() {
    this.loading.autoHide(2000);
    this.iab.create(this.product.products_url, "blank");
  }
  addToCartProduct() {
    this.loading.autoHide(500);
    // console.log(this.product);
    this.shared.addToCart(this.product, this.attributes);
    this.navCtrl.pop();
  }

  //============================================================================================  
  //function adding attibute into array
  fillAttributes(val, optionID) {
    //console.log(val);
    //  console.log(this.attributes);
    this.attributes.forEach((value, index) => {
      if (optionID == value.products_options_id) {
        value.products_options_values_id = val.id;
        value.options_values_price = val.price;
        value.price_prefix = val.price_prefix;
        value.attribute_id = val.products_attributes_id;
        value.products_options_values = val.value;
        value.name = val.value + ' ' + val.price_prefix + val.price + " " + this.config.currency
      }
    });
    console.log(this.attributes);
    //calculating total price 
    this.calculatingTotalPrice();
    this.checkAvailability();
  };
  //============================================================================================  
  //calculating total price  
  calculatingTotalPrice() {
    var price = parseFloat(this.product.products_price.toString());
    if (this.product.discount_price != null || this.product.discount_price != undefined)
      price = this.product.discount_price;
    var totalPrice = this.shared.calculateFinalPriceService(this.attributes) + parseFloat(price.toString());

    if (this.product.discount_price != null || this.product.discount_price != undefined)
      this.discount_price = totalPrice;
    else
      this.product_price = totalPrice;
    //  console.log(totalPrice);
  };

  checkProductNew() {
    var pDate = new Date(this.product.products_date_added);
    var date = pDate.getTime() + this.config.newProductDuration * 86400000;
    var todayDate = new Date().getTime();
    if (date > todayDate)
      return true;
    else
      return false
  }

  pDiscount() {
    var rtn = "";
    var p1 = parseInt(this.product.products_price);
    var p2 = parseInt(this.product.discount_price);
    if (p1 == 0 || p2 == null || p2 == undefined || p2 == 0) { rtn = ""; }
    var result = Math.abs((p1 - p2) / p1 * 100);
    result = parseInt(result.toString());
    if (result == 0) { rtn = "" }
    rtn = result + '%';
    return rtn;
  }
  share() {
    this.loading.autoHide(1000);
    // Share via email
    this.socialSharing.share(
      this.product.products_name,
      this.product.products_name,
      this.config.url + this.product.products_image,
      this.config.yourSiteUrl + "/product-detail/" + this.product.products_slug).then(() => {
        // Success!
      }).catch(() => {
        // Error!
      });

  }
  async clickWishList() {

    if (this.shared.customerData.customers_id == null || this.shared.customerData.customers_id == undefined) {
      let modal = await this.modalCtrl.create({
        component: LoginPage,
        componentProps: {
          'hideGuestLogin': true
        }
      });
      return await modal.present();
    }
    else {
      if (this.product.isLiked == '0') { this.addWishList(); }
      else this.removeWishList();
    }
  }
  addWishList() {
    this.shared.addWishList(this.product);
  }
  removeWishList() {
    this.shared.removeWishList(this.product);
  }

  //===============================================================================================================================
  // <!-- 2.0 updates -->
  openReviewsPage() {
    this.navCtrl.navigateForward("/reviews/" + this.product.products_id);
  }

  ratingPercentage() {
    return this.shared.getProductRatingPercentage(this.product.rating);
  }

  ngOnInit() {
    if (this.product.flash_start_date) {
      if (this.product.server_time < this.product.flash_start_date) this.is_upcomming = true;
      console.log("server time less than " + (this.product.server_time - this.product.flash_start_date));
    }
  }


  //===============================================================================================================================
  // getProductReviews() {
  //   this.config.getHttp("getreviews?languages_id=" + this.config.langId + "&products_id=" + this.product.id).then((data: any) => {
  //     this.product.reviewed_customers = data.data
  //   });
  // }

  ionViewWillEnter() {
    // this.getProductReviews();
  }

}

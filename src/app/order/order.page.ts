import { Component, OnInit, ApplicationRef, ViewChild } from '@angular/core';
import { NavController, ActionSheetController, IonContent, Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/providers/config/config.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { LoadingService } from 'src/providers/loading/loading.service';
import { CouponService } from 'src/providers/coupon/coupon.service';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { Stripe } from '@ionic-native/stripe/ngx';
import { PaytmService } from 'src/providers/paytm/paytm.service';
import { HTTP } from '@ionic-native/http/ngx';

declare var Instamojo: any;
declare var braintree;
declare var RazorpayCheckout: any;

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {

  @ViewChild(IonContent, { static: false }) content: IonContent;

  c;
  orderDetail: { [k: string]: any } = {};//include shipping address, billing address,  shipping methods.
  products = [];
  couponArray = [];
  couponApplied = 0;
  tokenFromServer = null;
  discount = 0;
  productsTotal = 0;
  totalAmountWithDisocunt = 0;
  nonce = '';
  stripeCard = {
    number: '',
    expMonth: 1,
    expYear: 2020,
    cvc: ''
  };

  paymentMethods = [];
  paypalClientId = '';
  paypalEnviroment = '';
  publicKeyStripe = '';
  razorPayKey: any;
  keyRazorPay: any;
  constructor(
    public navCtrl: NavController,
    public httpClient: HttpClient,
    public config: ConfigService,
    public shared: SharedDataService,
    public loading: LoadingService,
    public couponProvider: CouponService,
    public actionSheetCtrl: ActionSheetController,
    public iab: InAppBrowser,
    public platform: Platform,
    public paytmService: PaytmService,
    private httpNative: HTTP,
    private stripe: Stripe,) {

  }

  // ============================================================================================  
  // placing order
  addOrder(nonce) {
    this.loading.autoHide(5000);
    this.orderDetail.customers_id = this.shared.customerData.customers_id;
    this.orderDetail.customers_name = this.shared.orderDetails.delivery_firstname + ' ' + this.shared.orderDetails.delivery_lastname;
    this.orderDetail.delivery_name = this.shared.orderDetails.billing_firstname + ' ' + this.shared.orderDetails.billing_lastname;

    if (this.shared.orderDetails.guest_status == 1) {
      this.orderDetail.email = this.shared.orderDetails.email;
      this.orderDetail.customers_telephone = this.shared.orderDetails.delivery_phone;
    }
    else {
      this.orderDetail.email = this.shared.customerData.email;
      this.orderDetail.customers_telephone = this.shared.customerData.customers_telephone;
    }
    this.orderDetail.latitude = this.shared.orderDetails.delivery_lat
    this.orderDetail.longitude = this.shared.orderDetails.delivery_long
    this.orderDetail.delivery_suburb = this.shared.orderDetails.delivery_state
    this.orderDetail.customers_suburb = this.shared.orderDetails.delivery_state;
    this.orderDetail.customers_address_format_id = '1';
    this.orderDetail.delivery_address_format_id = '1';
    this.orderDetail.products = this.products;
    this.orderDetail.is_coupon_applied = this.couponApplied;
    this.orderDetail.coupons = this.couponArray;
    this.orderDetail.coupon_amount = this.discount;
    this.orderDetail.totalPrice = this.totalAmountWithDisocunt;
    this.orderDetail.nonce = nonce;
    this.orderDetail.language_id = this.config.langId;
    this.orderDetail.currency_code = this.config.currecnyCode;
    var dat = this.orderDetail;
    console.log(dat);
    this.config.postHttp('addtoorder', dat).then((data: any) => {
      // this.loading.hide();
      if (data.success == 1) {
        this.products = [];
        this.orderDetail = {};
        //this.shared.orderDetails = {};
        this.navCtrl.navigateRoot(this.config.currentRoute + "/thank-you");
      }
      if (data.success == 0) {
        this.shared.showAlert(data.message);
        if (this.config.appNavigationTabs)
          this.navCtrl.navigateBack("tabs/cart");
        else
          this.navCtrl.navigateBack("/cart");
        if (data.products_id)
          this.shared.productDeleteId = data.products_id;
      }
    }, err => {
      this.shared.showAlert("Server Error" + " " + err.status);
    });
  };
  initializePaymentMethods() {
    // this.loading.show();
    let dat: { [k: string]: any } = {};
    dat.language_id = this.config.langId;
    dat.currency_code = this.config.currecnyCode;
    this.config.postHttp('getpaymentmethods', dat).then((data: any) => {
      //  this.loading.hide();
      if (data.success == 1) {
        this.paymentMethods = data.data;
        for (let a of data.data) {
          // if (a.method == "braintree_card" && a.active == '1') { this.getToken(); }
          // if (a.method == "braintree_paypal" && a.active == '1') { this.getToken(); }

          if (a.method == 'paypal' && a.active == '1') {
            this.paypalClientId = a.public_key;
            if (a.environment == 'Test') this.paypalEnviroment = 'PayPalEnvironmentSandbox';
            else this.paypalEnviroment = 'PayPalEnvironmentProduction'
          }
          if (a.method == 'stripe' && a.active == '1') {
            this.publicKeyStripe = a.public_key;
            this.stripe.setPublishableKey(a.public_key);
          }

          if (a.method == 'razorpay') {
            this.keyRazorPay = a.public_key;
          }

          // if (a.method == "paytm") {
          //   this.paytmS = a.public_key;
          // }
        }
      }
    },
      err => {
        this.shared.showAlert('getPaymentMethods Server Error');
      });
  }

  stripePayment() {
    // this.loading.show();
    this.stripe.createCardToken(this.stripeCard)
      .then(token => {
        // this.loading.hide();
        // this.nonce = token.id
        this.addOrder(token.id);
      })
      .catch(error => {
        // this.loading.hide();
        let err = error;
        if (error.message) err = error.message;
        console.log(err);
        this.shared.showAlert(err)
      });
  }

  //============================================================================================  
  //CAlculate Discount total
  calculateDiscount = function () {
    var subTotal = 0;
    var total = 0;
    for (let value of this.products) {
      subTotal += parseFloat(value.subtotal);
      total += value.total;
    }
    this.productsTotal = subTotal;
    this.discount = (subTotal - total);
  };

  //============================================================================================  
  //CAlculate all total
  calculateTotal = function () {
    let a = 0;
    for (let value of this.products) {
      // console.log(value);
      var subtotal = parseFloat(value.total);
      a = a + subtotal;
    }

    let b = parseFloat(this.orderDetail.total_tax.toString());
    let c = parseFloat(this.orderDetail.shipping_cost.toString());
    this.totalAmountWithDisocunt = parseFloat((parseFloat(a.toString()) + b + c).toString());
    // console.log(" all total " + $scope.totalAmountWithDisocunt);
    // console.log("shipping_tax " + $scope.orderDetail.shipping_tax);
    // console.log(" shipping_cost " + $scope.orderDetail.shipping_cost);
    this.calculateDiscount();
  };

  //============================================================================================  
  //delete Coupon
  deleteCoupon = function (code) {

    this.couponArray.forEach((value, index) => {
      if (value.code == code) { this.couponArray.splice(index, 1); return true; }
    });


    this.products = (JSON.parse(JSON.stringify(this.shared.cartProducts)));
    this.orderDetail.shipping_cost = this.shared.orderDetails.shipping_cost;

    this.couponArray.forEach((value) => {
      //checking for free shipping
      if (value.free_shipping == true) {
        this.orderDetail.shippingName = 'free shipping';
        this.orderDetail.shippingCost = 0;
      }
      this.products = this.couponProvider.apply(value, this.products);
    });
    this.calculateTotal();
    if (this.couponArray.length == 0) {
      this.couponApplied = 0;
    }
  };
  //========================================================================================

  //============================================================================================   
  //getting getMostLikedProducts from the server
  getCoupon = function (code) {
    if (code == '' || code == null) {
      this.shared.showAlert('Please enter coupon code!');
      return 0;
    }
    this.loading.show();
    var dat = { 'code': code };
    this.config.postHttp('getcoupon', dat).then((data: any) => {
      this.loading.hide();
      if (data.success == 1) {
        let coupon = data.data[0]
        // console.log($scope.coupon)
        this.applyCouponCart(coupon);
      }
      if (data.success == 0) {
        this.shared.showAlert(data.message);
      }
    }, error => {
      this.loading.hide();
      console.log(error);
    });

  };

  //============================================================================================  
  //applying coupon on the cart
  applyCouponCart = function (coupon) {
    //checking the coupon is valid or not

    if (this.couponProvider.validateCouponService(coupon, this.products, this.couponArray) == false) {
      return 0;
    } else {
      if (coupon.individual_use == 1) {
        this.products = (JSON.parse(JSON.stringify(this.shared.cartProducts)));
        this.couponArray = [];
        this.orderDetail.shipping_cost = this.shared.orderDetails.shipping_cost;
        console.log('individual_use');
      }
      var v: { [k: string]: any } = {};
      v.code = coupon.code;
      v.amount = coupon.amount;
      v.product_ids = coupon.product_ids;
      v.exclude_product_ids = coupon.exclude_product_ids;
      v.product_categories = coupon.product_categories;
      v.excluded_product_categories = coupon.excluded_product_categories;
      v.discount = coupon.amount;
      v.individual_use = coupon.individual_use;
      v.free_shipping = coupon.free_shipping;
      v.discount_type = coupon.discount_type;
      //   v.limit_usage_to_x_items = coupon.limit_usage_to_x_items;
      //  v.usage_limit = coupon.usage_limit;
      // v.used_by = coupon.used_by ;
      // v.usage_limit_per_user = coupon.usage_limit_per_user ;
      // v.exclude_sale_items = coupon.exclude_sale_items;
      this.couponArray.push(v);
    }


    //checking for free shipping
    if (coupon.free_shipping == 1) {
      // $scope.orderDetail.shippingName = 'free shipping';
      this.orderDetail.shipping_cost = 0;
      //  console.log('free_shipping');
    }
    //applying coupon service
    this.products = this.couponProvider.apply(coupon, this.products);
    if (this.couponArray.length != 0) {
      this.couponApplied = 1;
    }
    this.calculateTotal();
  };


  async couponslist() {
    // + '<li>Cart Percentage <span>(cp9989)</a><p>{{"A percentage discount for the entire cart"|translate}}</p></li>'
    //   + '<li>Cart Fixed <span>(cf9999)</span> <p>{{"A fixed total discount for the entire cart"|translate}}</p></li>'
    //   + '<li>Product Fixed <span>(pf8787)</span></a><p>{{"A fixed total discount for selected products only"|translate}}</p></li>'
    //   + '<li>Product Percentage <span>(pp2233)</span><p>{{"A percentage discount for selected products only"|translate}}</p></li>'
    //   + '</ul>';
    // this.translate.get(array).subscribe((res) => { });
    let actionSheet = this.actionSheetCtrl.create({
      header: 'Coupons List',
      buttons: [
        {
          icon: 'arrow-round-forward',
          text: 'Cart Percentage (cp9989). A percentage discount for selected products only',
          handler: () => {
            this.c = 'cp9989';
          }
        }, {
          icon: 'arrow-round-forward',
          text: 'Product Fixed (pf8787). A fixed total discount for selected products only',
          handler: () => {
            this.c = 'pf8787';
          }
        },
        {
          icon: 'arrow-round-forward',
          text: 'Cart Fixed (cf9999). A fixed total discount for the entire cart',
          handler: () => {
            this.c = 'cf9999';
          }
        },
        {
          icon: 'arrow-round-forward',
          text: 'Product Percentage (pp2233). A percentage discount for selected products only',
          handler: () => {
            this.c = 'pp2233';
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        }
      ]
    });
    (await actionSheet).present();
  }
  //============================================================================================  
  //getting token from server
  getToken() {
    this.loading.autoHide(2000);
    this.config.getHttp('generatebraintreetoken').then((data: any) => {
      // this.loading.hide();
      if (data.success == 1) {
        if (this.tokenFromServer == null) {
          this.tokenFromServer = data.token;
          if (this.orderDetail.payment_method == 'braintree_paypal') this.braintreePaypal(this.tokenFromServer);
          if (this.orderDetail.payment_method == 'braintree_card') this.braintreeCreditCard(this.tokenFromServer);
        }
      }
      if (data.success == 0) {

      }
    }, error => {
      // this.loading.hide();
      // if (this.paymentBraintree) {
      this.shared.showAlert('Server Error' + ' ' + error.status + ' Braintree Token');
      // }

    });
  };
  //================================================================================
  // braintree paypal method
  braintreePaypal(clientToken) {
    this.loading.autoHide(2000);
    var nonce = 0;
    var _this = this;
    var promise = new Promise((resolve, reject) => {
      braintree.setup(clientToken, "custom", {
        paypal: {
          container: "paypal-container",
          displayName: "Shop"
        },
        onReady: function () {
          _this.scrollToBottom();
          // $(document).find('#braintree-paypal-button').attr('href', 'javascript:void(0)');
        },
        onPaymentMethodReceived: function (obj) {
          //   console.log(obj.nonce);
          // this.nonce = obj.nonce;
          nonce = obj.nonce;
          resolve();
        }
      });


    });

    promise.then(
      (data) => {
        // console.log(nonce);
        this.addOrder(nonce);
      },
      (err) => { console.log(err); }
    );

  };
  //================================================================================
  // braintree creditcard method
  braintreeCreditCard(clientToken) {
    // this.loading.autoHide(2000);
    var nonce = 0;
    var promise = new Promise((resolve, reject) => {

      var braintreeForm = document.querySelector('#braintree-form');
      var braintreeSubmit = document.querySelector('ion-button[id="braintreesubmit"]');
      braintree.client.create({
        authorization: clientToken
      }, function (clientErr, clientInstance) {
        if (clientErr) { }

        braintree.hostedFields.create({
          client: clientInstance,
          styles: {

          },
          fields: {
            number: {
              selector: '#card-number',
              placeholder: '4111 1111 1111 1111'
            },
            cvv: {
              selector: '#cvv',
              placeholder: '123'
            },
            expirationDate: {
              selector: '#expiration-date',
              placeholder: '10/2019'
            }
          }
        }, function (hostedFieldsErr, hostedFieldsInstance) {
          if (hostedFieldsErr) {
            // Handle error in Hosted Fields creation
            //alert("hostedFieldsErr" + hostedFieldsErr);
            document.getElementById('error-message').innerHTML = "hostedFieldsErr" + hostedFieldsErr;
            console.log("hostedFieldsErr" + hostedFieldsErr);
            return;
          }

          braintreeSubmit.removeAttribute('disabled');
          braintreeForm.addEventListener('submit', function (event) {
            document.getElementById('error-message').innerHTML = null;
            event.preventDefault();
            hostedFieldsInstance.tokenize(function (tokenizeErr, payload) {
              if (tokenizeErr) {
                //alert('Error : ' + JSON.stringify(tokenizeErr.message));
                // Handle error in Hosted Fields tokenization
                document.getElementById('error-message').innerHTML = tokenizeErr.message;
                return 0;
              }
              // Put `payload.nonce` into the `payment-method-nonce` input, and then
              // submit the form. Alternatively, you could send the nonce to your server
              // with AJAX.

              // document.querySelector('input[name="payment-method-nonce"]').value = payload.nonce;
              // this.nonce = payload.nonce;
              // this.addOrder(payload.nonce);
              nonce = payload.nonce;
              resolve();
              //  console.log(payload.nonce);

            });
          }, false);
        });
      });

    });
    promise.then(
      (data) => { //console.log(nonce); 
        this.addOrder(nonce);
      },
      (err) => { console.log(err); }
    );
  }
  paymentMehodChanged() {
    if (this.orderDetail.payment_method == "braintree_paypal") this.getToken();
    if (this.orderDetail.payment_method == "braintree_card") this.getToken();
    // if (this.orderDetail.payment_method == "stripe") this.stripe.setPublishableKey(this.publicKeyStripe);
    this.scrollToBottom();
  }
  scrollToBottom() {

    setTimeout(() => {
      this.content.scrollToBottom();
      console.log("botton");
    }, 300);

  }

  //================================= instamojo ===========================

  instamojoPayment() {
    let instamojoClient = new Instamojo(this.httpNative, this.iab, this.config.url + 'instamojotoken');
    var data = instamojoClient.getPaymentFields();
    data.buyer_name = this.shared.customerData.customers_firstname + " " + this.shared.customerData.customers_lastname
    data.currency = this.config.currency;
    data.purpose = "Order Payment";            // REQUIRED
    data.amount = this.totalAmountWithDisocunt;                  // REQUIRED
    //data.phone = this.shared.customerData.customers_telephone
    data.email = this.shared.customerData.email;
    data.send_email = true;
    data.send_sms = false;
    data.allow_repeated_payments = true;

    // do not change this
    data.redirect_url = "http://localhost";
    instamojoClient.payNow(data).then(response => {
      console.log(response);
      this.addOrder(response.id);
      // alert("Payment complete: " + JSON.stringify(response));
    }).catch(err => {
      console.log(err);
      this.shared.showAlert("Payment failed: " + JSON.stringify(err));
      throw err;
    });

  }
  //
  razorPay() {
    if (this.config.currecnyCode.toLowerCase() != "inr") {
      this.shared.showAlert("Razor Pay only Works with Indian Currency(INR)!");
      return 0;
    }
    let customerName = this.shared.customerData.customers_firstname + " " + this.shared.customerData.customers_lastname
    let cutomerEmail = this.shared.customerData.email;
    let cutomerPhone = this.shared.customerData.customers_telephone;
    let amount = parseInt((this.totalAmountWithDisocunt * 100).toString());
    //let amount = parseInt((this.totalAmountWithDisocunt.toFixed(2)).toString());

    var options = {
      description: 'Order Payment',
      //image: 'https://i.imgur.com/3g7nmJC.png',
      currency: this.config.currecnyCode,
      key: this.keyRazorPay,
      amount: amount,
      name: customerName,
      prefill: {
        email: cutomerEmail,
        contact: cutomerPhone,
        name: customerName
      },
      theme: {
        color: this.shared.primaryHexColor
      },
      modal: {
        ondismiss: function () {
          //alert('dismissed')
        }
      }
    };

    let _this = this;
    var successCallback = function (payment_id) {
      _this.addOrder(payment_id);
    };

    var cancelCallback = function (error) {
      _this.shared.toast(error.description + ' (Error ' + error.code + ')');
    };


    RazorpayCheckout.open(options, successCallback, cancelCallback);
    if (this.platform.is('android')) {
      this.platform.resume.subscribe((event) => {
        // Re-register the payment success and cancel callbacks
        RazorpayCheckout.on('payment.success', successCallback)
        RazorpayCheckout.on('payment.cancel', cancelCallback)
        // Pass on the event to RazorpayCheckout
        RazorpayCheckout.onResume(event);

      })
    };
  }


  paytmPayment() {
    let mId = ""
    let amount = parseInt((this.totalAmountWithDisocunt.toFixed(2)).toString());
    let production = true;

    let cutomerId = 0;
    if (this.shared.customerData.customers_id)
      cutomerId = this.shared.customerData.customers_id;
    let checkSum = ""
    let orderId = ""

    this.paymentMethods.forEach(element => {
      if (element.method == "paytm") {
        mId = element.public_key;

        if (element.environment == "Test") {
          production = false
        }
      }
    });


    this.loading.show();
    this.config.getHttp("generatpaytmhashes").then((data: any) => {
      this.loading.hide();
      checkSum = data.data.CHECKSUMHASH;
      orderId = data.data.ORDER_ID;
      this.paytmService.paytmpage(checkSum, orderId, mId, cutomerId, amount, production).then((data: any) => {
        if (data.status == "sucess") {
          this.addOrder(data.id);
        }
        else {
          this.shared.toast("Paytm Error");
        }
      });
    });
  }
  ngOnInit() {
    this.orderDetail = (JSON.parse(JSON.stringify(this.shared.orderDetails)));
    this.products = (JSON.parse(JSON.stringify(this.shared.cartProducts)));
    this.calculateTotal();
    this.initializePaymentMethods();
  }


  ionViewDidEnter() {
    var toolbar = document.getElementsByTagName("ion-toolbar");
    var style = getComputedStyle(toolbar[0]);
    var color = style.getPropertyValue("--ion-color-primary") || undefined;
    this.shared.primaryHexColor = color;
    console.log(color);
  }
  openHomePage() {
    this.navCtrl.navigateRoot(this.config.currentRoute + "/cart");
  }
  hyperpayPayment() {
    this.addOrder("null");
  }
}

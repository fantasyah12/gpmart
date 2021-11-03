import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, NavParams, IonContent } from '@ionic/angular';
import { ConfigService } from 'src/providers/config/config.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { LoadingService } from 'src/providers/loading/loading.service';
import { GoogleMaps, GoogleMapsEvent, LatLng, Marker, Environment } from '@ionic-native/google-maps';

import * as firebase from 'firebase/app';
import 'firebase/database';
@Component({
  selector: 'app-my-order-detail',
  templateUrl: './my-order-detail.page.html',
  styleUrls: ['./my-order-detail.page.scss'],
})
export class MyOrderDetailPage implements OnInit {

  @ViewChild(IonContent, { static: false }) content: IonContent;

  order: { [k: string]: any } = {};
  constructor(
    public navCtrl: NavController,
    public config: ConfigService,
    public shared: SharedDataService,
    public loading: LoadingService,
  ) {
    this.order = this.shared.myOrderDetialPageData;
  }
  getSingleProductDetail(id) {
    var dat: { [k: string]: any } = {};
    if (this.shared.customerData != null)
      dat.customers_id = this.shared.customerData.customers_id;
    else
      dat.customers_id = null;
    dat.products_id = id;
    dat.language_id = this.config.langId;
    dat.currency_code = this.config.currecnyCode;
    this.config.postHttp(this.config.url + 'getallproducts', dat).then((data: any) => {
      this.loading.hide();
      if (data.success == 1) {
        let p = data.product_data[0]
        this.shared.singleProductPageData.push(p);
        this.navCtrl.navigateForward(this.config.currentRoute + "product-detail/" + p.id);
      }
    });
  }

  getSubtotal() {
    let total = 0;
    this.order.data.forEach(element => {
      total += parseFloat(element.final_price);
    });
    return total;
  }

  ionViewDidEnter() {
    this.order = this.shared.myOrderDetialPageData;
  }
  // For Scroll To Top Content
  scrollToBottom() {
    this.content.scrollToBottom(700);
  }
  trackOrder() {
    this.scrollToBottom();
    let _this = this;
    var deliveryBoyLocationDatabase = firebase.database().ref('location/' + this.order.deliveryboy_info[0].deliveryboy_id);
    deliveryBoyLocationDatabase.on('value', function (value) {
      // console.log(value.val());
      var loc = value.val()
      _this.loadMap(loc.latitude, loc.longitude);
    });
  }
  public countLoation = 0;

  public orderMap;
  public marker;
  loadMap(latitude, longitude) {

    if (this.countLoation == 0) {
      // This code is necessary for browser
      Environment.setEnv({
        'API_KEY_FOR_BROWSER_RELEASE': this.config.appSettings.google_map_api,
        //'API_KEY_FOR_BROWSER_DEBUG': this.config.googleMapId
      });
      /* The create() function will take the ID of your map element */
      this.orderMap = GoogleMaps.create('maporder');
      this.orderMap.one(GoogleMapsEvent.MAP_READY).then((data: any) => {
        const coordinates: LatLng = new LatLng(latitude, longitude);

        this.orderMap.setCameraTarget(coordinates);
        this.orderMap.setCameraZoom(16);
      });

      this.shared.translateString("My Location").then((data: any) => {
        this.orderMap.addMarker({
          position: { lat: this.order.delivery_latitude, lng: this.order.delivery_longitude },
          title: data,
        })
      })
      this.shared.translateString("Delivery Boy").then((data: any) => {
        this.marker = this.orderMap.addMarker({
          position: { lat: latitude, lng: longitude },
          title: data,
          icon: 'blue'
        }).then((m) => {
          this.marker = m;
        }, (error) => {
          console.log(error);
        });
      })
    }
    else {
      if (this.marker)
        this.marker.setPosition(new LatLng(latitude, longitude));
      const c: LatLng = new LatLng(latitude, longitude);
      this.orderMap.setCameraTarget(c);
    }


    let _this = this;
    this.countLoation++;
  }
  ngOnInit() {
  }

}

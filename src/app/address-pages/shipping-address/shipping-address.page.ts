import { Component, OnInit } from '@angular/core';


import { ConfigService } from 'src/providers/config/config.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { ModalController, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from 'src/providers/loading/loading.service';
import { UserAddressService } from 'src/providers/user-address/user-address.service';
import { SelectCountryPage } from 'src/app/modals/select-country/select-country.page';
import { SelectZonesPage } from 'src/app/modals/select-zones/select-zones.page';
import { AppEventsService } from 'src/providers/app-events/app-events.service';
import { FirebasePhoneAuthService } from 'src/providers/firebase-phone-auth/firebase-phone-auth.service';
@Component({
  selector: 'app-shipping-address',
  templateUrl: './shipping-address.page.html',
  styleUrls: ['./shipping-address.page.scss'],
})
export class ShippingAddressPage implements OnInit {

  showMap = false;
  constructor(
    public navCtrl: NavController,
    public config: ConfigService,
    public http: HttpClient,
    public shared: SharedDataService,
    public modalCtrl: ModalController,
    public loading: LoadingService,
    public appEventsService: AppEventsService,
    public firebasePhoneAuthService: FirebasePhoneAuthService,
    public userAddress: UserAddressService,) {
    if (this.shared.orderDetails.guest_status == 0) {
      if (this.shared.orderDetails.delivery_firstname == "")
        this.getUserAddress();
    }
  }

  showGoogleMap() {

    this.showMap = true;
  }

  locationUpdated() {
    this.showMap = false;
  }
  getUserAddress() {
    this.loading.show();
    var dat: { [k: string]: any } = {};
    dat.customers_id = this.shared.customerData.customers_id;
    this.config.postHttp('getalladdress', dat).then((data: any) => {
      this.loading.hide();
      if (data.success == 1) {
        var allShippingAddress = data.data;
        for (let value of allShippingAddress) {
          if (value.default_address == 1) {

            this.shared.orderDetails.tax_zone_id = value.zone_id;
            this.shared.orderDetails.delivery_firstname = value.firstname;
            this.shared.orderDetails.delivery_lastname = value.lastname;
            this.shared.orderDetails.delivery_state = value.state;
            this.shared.orderDetails.delivery_city = value.city;
            this.shared.orderDetails.delivery_postcode = value.postcode;
            this.shared.orderDetails.delivery_zone = value.zone_name;
            this.shared.orderDetails.delivery_country = value.country_name;
            this.shared.orderDetails.delivery_country_id = value.countries_id;
            this.shared.orderDetails.delivery_street_address = value.street;
            // if ($rootScope.zones.length == 0)
            if (value.zone_code == null) {
              //  console.log(c);
              this.shared.orderDetails.delivery_zone = 'other';
              this.shared.orderDetails.delivery_state = 'other';
              this.shared.orderDetails.tax_zone_id = null;
            }
          }

        }
      }
      if (data.success == 0) { }
    });

    this.shared.orderDetails.delivery_phone = this.shared.customerData.customers_telephone;
  }
  async selectCountryPage() {

    let modal = await this.modalCtrl.create({
      component: SelectCountryPage,
      componentProps: { page: 'shipping' }
    });

    return await modal.present();
  }

  async selectZonePage() {

    let modal = await this.modalCtrl.create({
      component: SelectZonesPage,
      componentProps: { page: 'shipping', id: this.shared.orderDetails.delivery_country_id }
    });

    return await modal.present();
  }
  submit() {
    if (this.shared.orderDetails.guest_status == 1 && this.config.enablePhoneLogin) {
      if (this.config.phoneAuthWithFirebase)
        this.firebasePhoneAuthService.verifyPhoneNumber(this.shared.orderDetails.delivery_phone);

      let loginWithPhoneNumber = this.appEventsService.subscribe("loginWithPhoneNumber");
      loginWithPhoneNumber.subscriptions.add(loginWithPhoneNumber.event.subscribe(data => {
        this.navCtrl.navigateForward(this.config.currentRoute + "/billing-address");
      }));
    }
    else
      this.navCtrl.navigateForward(this.config.currentRoute + "/billing-address");
  }

  getLocationAddress() {
    //this.loading.show();
    let locationEnable = false
    this.userAddress.getCordinates().then((value: any) => {
      locationEnable = true;
      // this.loading.hide();
      this.shared.orderDetails.delivery_lat = value.lat
      this.shared.orderDetails.delivery_long = value.long
      this.shared.orderDetails.delivery_location = value.lat + ", " + value.long
    });

    setTimeout(() => {
      if (locationEnable == false) {
        this.shared.showAlert("Please Turn On Device Location");
      }
    }, 10000);
  }

  ngOnInit() {
    if (this.config.enableAddressMap && this.shared.orderDetails.delivery_location == "")
      this.getLocationAddress();
  }

  ionViewWillEnter() {
    if (this.shared.customerData.customers_id == null) {
      this.shared.orderDetails.tax_zone_id = '';
      this.shared.orderDetails.delivery_firstname = '';
      this.shared.orderDetails.delivery_lastname = '';
      this.shared.orderDetails.delivery_state = '';
      this.shared.orderDetails.delivery_city = '';
      this.shared.orderDetails.delivery_postcode = '';
      this.shared.orderDetails.delivery_zone = '';
      this.shared.orderDetails.delivery_country = '';
      this.shared.orderDetails.delivery_country_id = '';
      this.shared.orderDetails.delivery_street_address = '';
    }

  }
}

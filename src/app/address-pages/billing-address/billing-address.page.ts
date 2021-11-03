import { Component, OnInit, ApplicationRef } from '@angular/core';
import { ConfigService } from 'src/providers/config/config.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { ModalController, NavController } from '@ionic/angular';
import { SelectCountryPage } from 'src/app/modals/select-country/select-country.page';
import { SelectZonesPage } from 'src/app/modals/select-zones/select-zones.page';
import { LoadingService } from 'src/providers/loading/loading.service';
import { UserAddressService } from 'src/providers/user-address/user-address.service';
@Component({
  selector: 'app-billing-address',
  templateUrl: './billing-address.page.html',
  styleUrls: ['./billing-address.page.scss'],
})
export class BillingAddressPage implements OnInit {

  defaultAddress = true;
  constructor(
    public config: ConfigService,
    public shared: SharedDataService,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    private applicationRef: ApplicationRef,
    public loading: LoadingService,
    public userAddress: UserAddressService,
  ) {
    if (this.shared.orderDetails.billing_firstname == "")
      this.setAddress(true);
  }
  checkBoxOnChange() {
    this.setAddress(!this.defaultAddress);
  }
  setAddress(value) {
    if (value == true) {
      this.shared.orderDetails.billing_firstname = this.shared.orderDetails.delivery_firstname;
      this.shared.orderDetails.billing_lastname = this.shared.orderDetails.delivery_lastname;
      this.shared.orderDetails.billing_state = this.shared.orderDetails.delivery_state;
      this.shared.orderDetails.billing_city = this.shared.orderDetails.delivery_city;
      this.shared.orderDetails.billing_postcode = this.shared.orderDetails.delivery_postcode;
      this.shared.orderDetails.billing_zone = this.shared.orderDetails.delivery_zone;
      this.shared.orderDetails.billing_country = this.shared.orderDetails.delivery_country;
      this.shared.orderDetails.billing_country_id = this.shared.orderDetails.delivery_country_id;
      this.shared.orderDetails.billing_street_address = this.shared.orderDetails.delivery_street_address;
      this.shared.orderDetails.billing_phone = this.shared.orderDetails.delivery_phone;
      this.shared.orderDetails.billing_lat = this.shared.orderDetails.delivery_lat
      this.shared.orderDetails.billing_long = this.shared.orderDetails.delivery_long
      this.shared.orderDetails.billing_location = this.shared.orderDetails.delivery_location
    }
    else {
      this.shared.orderDetails.billing_firstname = '';
      this.shared.orderDetails.billing_lastname = '';
      this.shared.orderDetails.billing_state = '';
      this.shared.orderDetails.billing_city = '';
      this.shared.orderDetails.billing_postcode = '';
      this.shared.orderDetails.billing_zone = '';
      this.shared.orderDetails.billing_country = '';
      this.shared.orderDetails.billing_country_id = '';
      this.shared.orderDetails.billing_street_address = '';
      this.shared.orderDetails.billing_phone = "";
      this.shared.orderDetails.billing_lat = ""
      this.shared.orderDetails.billing_long = ""
      this.shared.orderDetails.billing_location = ""
    }
  }
  submit() {
    this.navCtrl.navigateForward(this.config.currentRoute + "/shipping-method");
    this.applicationRef.tick();
  }

  async selectCountryPage() {
    let modal = await this.modalCtrl.create({
      component: SelectCountryPage,
      componentProps: { page: 'billing' }
    });
    return await modal.present();
  }

  async selectZonePage() {
    let modal = await this.modalCtrl.create({
      component: SelectZonesPage,
      componentProps: { page: 'billing', id: this.shared.orderDetails.billing_country_id }
    });
    return await modal.present();
  }

  showMap = false;
  showGoogleMap() {

    this.showMap = true;
  }

  locationUpdated() {
    this.showMap = false;
  }
  getLocationAddress() {
    //this.loading.show();
    let locationEnable = false
    this.userAddress.getCordinates().then((value: any) => {
      locationEnable = true;
      //this.loading.hide();
      this.shared.orderDetails.billing_lat = value.lat
      this.shared.orderDetails.billing_long = value.long
      this.shared.orderDetails.billing_location = value.lat + ", " + value.long
    });

    setTimeout(() => {
      if (locationEnable == false) {
        this.shared.showAlert("Please Turn On Device Location");
      }
    }, 10000);
  }

  ngOnInit() {
    if (this.config.enableAddressMap && this.shared.orderDetails.billing_location == "")
      this.getLocationAddress();
  }

  ionViewWillEnter() {
    // if (this.shared.customerData.customers_id == null) {
    //   this.setAddress(false);
    // }

  }

}

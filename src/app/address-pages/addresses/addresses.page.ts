import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ConfigService } from 'src/providers/config/config.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { ModalController, NavController } from '@ionic/angular';
import { LoadingService } from 'src/providers/loading/loading.service';
import { EditAddressPage } from 'src/app/modals/edit-address/edit-address.page';
import { AppEventsService } from 'src/providers/app-events/app-events.service';

@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.page.html',
  styleUrls: ['./addresses.page.scss'],
})
export class AddressesPage implements OnInit {
  allShippingAddress = new Array;
  constructor(
    public navCtrl: NavController,
    public shared: SharedDataService,
    public modalCtrl: ModalController,
    public config: ConfigService,
    public storage: Storage,
    public appEventsService: AppEventsService,
    public loading: LoadingService,) {

  }

  getAllAddress() {
    this.loading.show();
    var dat = { customers_id: this.shared.customerData.customers_id };
    this.config.postHttp('getalladdress', dat).then((data: any) => {
      this.loading.hide();
      if (data.success == 1) {
        this.allShippingAddress = data.data;
        if (this.allShippingAddress.length == 1) this.defaultAddress(this.allShippingAddress[0].address_id);
      }
    });
  }

  //============================================================================================  
  // delete shipping address
  deleteAddress = function (id) {
    this.loading.show();
    var dat = {
      customers_id: this.shared.customerData.customers_id,
      address_book_id: id
    };
    this.config.postHttp('deleteshippingaddress', dat).then((data: any) => {
      this.loading.hide();
      if (data.success == 1) {
        this.getAllAddress();
      }
    }, function (response) {
      this.loading.hide();
      this.shared.toast("Error server not reponding");
    });
  };

  //============================================================================================  
  // default shipping address
  defaultAddress(id) {
    this.loading.show();
    var dat = {
      customers_id: this.shared.customerData.customers_id,
      address_book_id: id
    };
    this.config.postHttp('updatedefaultaddress', dat).then((data: any) => {
      this.loading.hide();
      // if (data.success == 1) 
      if (this.allShippingAddress.length > 1) this.getAllAddress();

    }, function (response) {
      this.loading.hide();
      this.shared.toast("Error server not reponding");
    });
  };
  async openEditShippingPage(data) {

    let modal = await this.modalCtrl.create({
      component: EditAddressPage,
      componentProps: { data: data, type: 'update' }
    });
    modal.onDidDismiss().then(() => {
      this.getAllAddress();
    })
    return await modal.present();
  }
  async addShippingAddress() {
    let modal = await this.modalCtrl.create({
      component: EditAddressPage,
      componentProps: { type: 'add' }
    });
    modal.onDidDismiss().then(() => {
      this.getAllAddress();
    })
    return await modal.present();
  }
  ionViewWillEnter() {
    this.getAllAddress();
  }
  ngOnInit() {

  }
}

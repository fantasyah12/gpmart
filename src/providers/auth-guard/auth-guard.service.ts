import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { LoginPage } from 'src/app/modals/login/login.page';
import { SharedDataService } from '../shared-data/shared-data.service';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(
    public modalCtrl: ModalController,
    public shared: SharedDataService
  ) {

  }
  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.shared.customerData.customers_id == null) {
      if (this.shared.orderDetails.guest_status == 0) {
        this.openLoginPage(route.data.hideGuestLogin);
        return false;
      }
      else if (this.shared.orderDetails.guest_status == 1) {
        return true;
      }
      else {
        this.openLoginPage(route.data.hideGuestLogin);
      }
    }
    else
      return true;
  }

  async openLoginPage(value) {

    console.log(value);

    let val = value;
    if (value == undefined)
      val = true;
      
    let modal = await this.modalCtrl.create({
      component: LoginPage,
      componentProps: {
        'hideGuestLogin': val
      }
    });
    return await modal.present();
  }
}

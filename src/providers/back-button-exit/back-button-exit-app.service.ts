import { Injectable } from '@angular/core';
import { IonRouterOutlet, Platform, NavController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class BackButtonExitAppService {

  public routerOutlets: any;
  constructor(
    public router: Router,
    public shared: SharedDataService,
    public plt: Platform,
    public config: ConfigService,
    public navCtrl: NavController,
    public modalCtrl: ModalController
  ) {
  }

  // set up hardware back button event.
  currentUrl = ""
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;

  // active hardware back button
  backButtonEvent() {

    this.plt.backButton.subscribe(async () => {
      this.currentUrl = this.router.url
      this.routerOutlets.forEach(async (outlet: IonRouterOutlet) => {
        if (outlet && outlet.canGoBack()) {
          outlet.pop();
        }
        else {
          this.checkIfModalIsOpen();
        }
      });
    });
  }
  checkIfModalIsOpen() {
    this.modalCtrl.getTop().then((data) => {
      if (data == undefined) this.tryToCloseTheApp();
    });
  }
  tryToCloseTheApp() {
    if (this.getCurrentTime() - this.lastTimeBackPress < this.timePeriodToExit) {
      navigator['app'].exitApp();
    } else if (this.isRootUrl()) {
      this.shared.toast('Press back again to exit App.', this.timePeriodToExit);
      this.lastTimeBackPress = this.getCurrentTime();
    }
  }
  isRootUrl() {
    console.log(this.currentUrl);
    if (this.config.appNavigationTabs == false) return true
    else {
      if (this.currentUrl == '/tabs/home') return true
      else if (this.currentUrl == '/tabs/home2') return true
      else if (this.currentUrl == '/tabs/home3') return true
      else if (this.currentUrl == '/tabs/home4') return true
      else if (this.currentUrl == '/tabs/home5') return true
      else if (this.currentUrl == '/tabs/home6') return true
      else if (this.currentUrl == '/tabs/home7') return true
      else if (this.currentUrl == '/tabs/home8') return true
      else if (this.currentUrl == '/tabs/home9') return true
      else if (this.currentUrl == '/tabs/home10') return true
      else if (this.currentUrl == '/tabs/cart') return true
      else if (this.currentUrl == '/tabs/search') return true
      else if (this.currentUrl == '/tabs/settings') return true
      else if (this.currentUrl == '/tabs/categories') return true
      else if (this.currentUrl == '/tabs/categories2') return true
      else if (this.currentUrl == '/tabs/categories3') return true
      else if (this.currentUrl == '/tabs/categories4') return true
      else if (this.currentUrl == '/tabs/categories5') return true
      else if (this.currentUrl == '/tabs/categories6') return true

    }
  }
  getCurrentTime() {
    return new Date().getTime();
  }
}

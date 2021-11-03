import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { ConfigService } from 'src/providers/config/config.service';
import { AppEventsService } from 'src/providers/app-events/app-events.service';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.page.html',
  styleUrls: ['./thank-you.page.scss'],
})
export class ThankYouPage implements OnInit {


  constructor(
    public navCtrl: NavController,
    public shared: SharedDataService,
    public config: ConfigService,
    public appEventsService: AppEventsService,
  ) {
  }
  openHome() {
    if (this.config.appNavigationTabs)
      this.navCtrl.navigateRoot("tabs/" + this.config.getCurrentHomePage());
    else
      this.navCtrl.navigateRoot(this.config.getCurrentHomePage());
  }
  openOrders() {
    if (this.config.appNavigationTabs)
    this.navCtrl.navigateRoot("tabs/settings/my-orders");
    else
    this.navCtrl.navigateRoot("my-orders");
  }
  goBack() {
    this.navCtrl.navigateRoot("tabs/cart");
  }
  ngOnInit() {
    this.shared.emptyCart();
  }

}

import { Injectable } from '@angular/core';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { NavController } from '@ionic/angular';
import { SharedDataService } from '../shared-data/shared-data.service';
import { ConfigService } from '../config/config.service';
import { LoadingService } from '../loading/loading.service';
import { ProductDetailPage } from 'src/app/product-detail/product-detail.page';

@Injectable({
  providedIn: 'root'
})
export class DeepLinkingService {

  public link = "empty";
  public linkArgs: any;
  public deepUrl = "";
  constructor(
    public navCtrl: NavController,
    public shared: SharedDataService,
    public config: ConfigService,
    public loading: LoadingService,
    public deeplinks: Deeplinks
  ) { }

  initializeDeepLinks() {
    //this.deeplinks.routeWithNavController(this.nav, {
    this.deeplinks.route({
      '/product-detail/:productSlug': ProductDetailPage
    }).subscribe(match => {
      // match.$route - the route we matched, which is the matched entry from the arguments to route()
      // match.$args - the args passed in the link
      // match.$link - the full link data
      //this.deepUrl = match.$link.url;
      let linkPath = match.$link.path;
      if (linkPath.indexOf('product-detail') != -1) {
        this.getSingleProductDetail(match.$args.productSlug);
      }
      console.log('Successfully matched route', match);
      //if (this.rootPage != undefined) this.naviagateDeeplink();
    }, nomatch => {
      // nomatch.$link - the full link data
      this.deepUrl = nomatch.$link.url;
      //if (this.rootPage != undefined) this.naviagateDeeplink();
      console.error('Got a deeplink that didn\'t match', nomatch);
    });

  }


  getSingleProductDetail(id) {
    this.loading.show();
    var dat: { [k: string]: any } = {};
    if (this.shared.customerData.customers_id)
      dat.customers_id = this.shared.customerData.customers_id;
    else
      dat.customers_id = null;
    dat.page_number = 0
    dat.products_slug = id;
    dat.language_id = this.config.langId;
    dat.currency_code = this.config.currecnyCode;
    this.config.postHttp('getallproducts', dat).then((data: any) => {
      this.loading.hide();
      if (data.success == 1) {
        this.shared.singleProductPageData.push(data.product_data[0]);
        this.navCtrl.navigateForward(this.config.currentRoute + "/product-detail/" + data.product_data[0].products_id);
      }
      console.log("getSingleProductDetail deeplink", dat, data);
    });
  }
}

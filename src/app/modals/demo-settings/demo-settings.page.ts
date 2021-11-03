import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { ConfigService } from 'src/providers/config/config.service';
import { LoadingService } from 'src/providers/loading/loading.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';

@Component({
  selector: 'app-demo-settings',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './demo-settings.page.html',
  styleUrls: ['./demo-settings.page.scss'],
})


export class DemoSettingsPage implements OnInit {
  colors = [
    { value: '#3E5902', name: 'default' },
    { value: '#ffffff', name: 'white' },
    { value: '#EC3F34', name: 'green' },
    { value: '#BF04A0', name: 'red' },
    { value: '#FCAD8E', name: 'magnesium' },
    { value: '#FF8EA6', name: 'salmon' },
    { value: '#44B3FF', name: 'plum' },
    { value: '#9546FE', name: 'blue' },
    { value: '#A6633C', name: 'pink' },
    { value: '#3CA68D', name: 'orange' },
    { value: '#3C51A6', name: 'maroon' },
    { value: '#726DFF', name: 'cayanne' },
    { value: '#FF6D6D', name: 'sea' },
    { value: '#B3182A', name: 'theme15' },
    { value: '#3980ff', name: 'theme16' },
    { value: '#483A6F', name: 'theme17' },
    { value: '#621529', name: 'theme18' },
    // { value: '#76d6ff', name: 'sky' },
    // { value: '#9437ff', name: 'grape' },
  ]
  //#000000, #EC3F34, #BF04A0, #FCAD8E, #FF8EA6, #44B3FF, #9546FE, #A6633C, #3CA68D, #, #, #

  currency: any;
  currencyList = [];


  public languages: any;
  selectedLanguage;
  translate;
  prviousLanguageId;
  navigation: any = 'bottom';
  themeMode: any = 'dark';
  loaderLanguages = true;
  loaderCurrecny = true;

  banner = "1";
  constructor(
    public loading: LoadingService,
    public modalCont: ModalController,
    public config: ConfigService,
    public nav: NavController,
    public shared: SharedDataService) {

    this.prviousLanguageId = localStorage.langId;
    //getting all languages
    this.config.getHttp('getlanguages').then((data: any) => {
      this.loaderLanguages = false;
      this.languages = data.languages;
      for (let data of this.languages) {
        if (data.languages_id == this.prviousLanguageId) {
          this.selectedLanguage = data;
        }
      }
    });
    this.getListOfCurrency();

    if (this.config.appNavigationTabs) {
      this.navigation = 'bottom'
    }
    else {
      this.navigation = 'left'
    }


    if (this.config.darkMode) {
      this.themeMode = 'dark'
    }
    else {
      this.themeMode = 'light'
    }

    this.banner = this.config.bannerStyle;
    console.log(this.config.appNavigationTabs, this.navigation);
    console.log(this.config.darkMode, this.themeMode);
  }

  navigationChange() {
    if (this.navigation == 'bottom') {
      this.config.appNavigationTabs = localStorage.tabsNavigation = true;
      this.config.currentRoute = "tabs/" + this.config.getCurrentHomePage();
      this.nav.navigateRoot(this.config.currentRoute);
    }
    else {
      this.config.appNavigationTabs = localStorage.tabsNavigation = false;
      this.config.currentRoute = "";
      this.nav.navigateRoot('home');
    }
    this.dismiss();
    console.log(localStorage.tabsNavigation);
    console.log(this.navigation);


  }
  modeChange() {
    if (this.themeMode == 'dark') {
      this.config.darkMode = true;
    }
    else {
      this.config.darkMode = false;
    }
    console.log("dasdasdadasd");
  }
  updateLanguage(lang) {
    if (lang != undefined && this.prviousLanguageId != lang.languages_id) {
      this.loading.show();
      localStorage.langId = lang.languages_id;
      localStorage.direction = lang.direction;
      this.shared.emptyCart();
      this.shared.emptyRecentViewed();
      setTimeout(() => {
        window.location.reload();
      }, 900);

    }
  }
  getListOfCurrency() {

    this.config.getHttp('getcurrencies').then((data: any) => {
      this.loaderCurrecny = false;
      this.currencyList = data.data;
      this.currencyList.forEach(val => {
        if (localStorage.currencyCode == val.code)
          this.currency = val;
      });
    });
  }
  updateCurrency() {
    if (this.currency == undefined) return;

    console.log(localStorage.currencyCode + "  " + this.currency.code);
    if (localStorage.currencyCode != this.currency.code) {
      this.loading.autoHide(1000);

      localStorage.currencyCode = this.currency.code;
      if (this.currency.symbol_left != null) {
        localStorage.currencyPos = "left";
        localStorage.currency = this.currency.symbol_left;
      }

      if (this.currency.symbol_right != null) {
        localStorage.currencyPos = "right";
        localStorage.currency = this.currency.symbol_right;
      }

      localStorage.decimals = this.currency.decimal_places;
      this.shared.emptyCart();
      this.shared.emptyRecentViewed();

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  setBannerStyle(banner) {
    this.config.setBannerStyle(banner);
    this.config.appSettings.banner_style = banner;

    if (this.navigation == "bottom")
      this.navigation = 'left'
    else
      this.navigation = 'bottom'
    this.navigationChange();

  }
  setCardStyle(card) {
    this.config.setCardStyle(card);
    this.dismiss();
  }
  //close modal
  dismiss() {
    this.modalCont.dismiss();
  }

  ngOnInit() {
  }
  changeAppTheme(value) {
    this.config.appTheme = value;
  }
}

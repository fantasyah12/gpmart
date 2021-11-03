import { Component, OnInit, ApplicationRef, ViewEncapsulation } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { ConfigService } from 'src/providers/config/config.service';
import { LoadingService } from 'src/providers/loading/loading.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { ActivatedRoute } from '@angular/router';
import { LoginPage } from '../modals/login/login.page';

@Component({
  selector: 'app-reviews',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './reviews.page.html',
  styleUrls: ['./reviews.page.scss'],
})
export class ReviewsPage implements OnInit {

  reviews = [];
  id;
  average;
  r1 = null;
  r2 = null;
  r3 = null;
  r4 = null;
  r5 = null;
  constructor(public navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private applicationRef: ApplicationRef,
    public config: ConfigService,
    public modalCtrl: ModalController,
    public loading: LoadingService,
    public shared: SharedDataService,) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  showHideContent(id, type) {
    var element = document.getElementById(id);
    if (type == "show") {
      document.getElementById("a" + id).style.whiteSpace = "normal";
      document.getElementById("more" + id).style.display = "none";
      document.getElementById("less" + id).style.display = "unset";
    }
    else {
      document.getElementById("a" + id).style.whiteSpace = "nowrap";
      document.getElementById("more" + id).style.display = "unset";
      document.getElementById("less" + id).style.display = "none";
    }
  }
  //===============================================================================================================================
  getProductReviews() {
    this.loading.show();
    this.config.getHttp("getreviews?languages_id=" + this.config.langId + "&products_id=" + this.id).then((data: any) => {
      this.reviews = data.data
      let total = 0;
      for (let value of this.reviews) {
        total = total + value.rating;
      }
      this.average = (total / this.reviews.length);
      if (this.reviews.length == 0) this.average = 0;

      this.calculateAll();

      this.loading.hide();
    });
  }
  //===============================================================================================================================
  async openReviewsPage() {
    this.navCtrl.navigateForward("/add-review/" + this.id);
  }
  //===============================================================================================================================
  // <!-- 2.0 updates -->
  totalRating() {
    let total = 0;
    for (let value of this.reviews) {
      total = total + value.rating;
    }

    let result = total;
    if (total == 0) result = 0;
    return result;
  }
  calculateAll() {
    let r1 = 0, r2 = 0, r3 = 0, r4 = 0, r5 = 0;
    let total = this.reviews.length;
    for (let value of this.reviews) {
      if (value.rating == 1) r1++;
      if (value.rating == 2) r2++;
      if (value.rating == 3) r3++;
      if (value.rating == 4) r4++;
      if (value.rating == 5) r5++;
      console.log(value.rating);
    }
    console.log();
    this.r1 = (100 / total) * r1; if (r1 == 0) this.r1 = 0;
    this.r2 = (100 / total) * r2; if (r2 == 0) this.r2 = 0;
    this.r3 = (100 / total) * r3; if (r3 == 0) this.r3 = 0;
    this.r4 = (100 / total) * r4; if (r4 == 0) this.r4 = 0;
    this.r5 = (100 / total) * r5; if (r5 == 0) this.r5 = 0;
  }

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.getProductReviews();
  }
}



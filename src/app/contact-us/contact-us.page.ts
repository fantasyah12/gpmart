import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { ConfigService } from 'src/providers/config/config.service';
import { NavController } from '@ionic/angular';
import { LoadingService } from 'src/providers/loading/loading.service';
import { HttpClient } from '@angular/common/http';
import { GoogleMaps, GoogleMapsEvent, LatLng, Marker } from '@ionic-native/google-maps';
declare var google;
@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
})

export class ContactUsPage implements OnInit {

  @ViewChild('map', { static: false }) mapElement: ElementRef;
  map: any;
  contact = {
    name: '',
    email: '',
    message: ''
  };
  errorMessage = '';

  constructor(
    public http: HttpClient,
    public config: ConfigService,
    public loading: LoadingService,
    public shared: SharedDataService,
  ) {

  }

  ionViewDidEnter() {
    this.loadMap();
  }
  submit() {
    this.loading.autoHide(3000);
    var dat = {};
    dat = this.contact;
    this.config.postHttp('contactus', dat).then((data: any) => {
      this.loading.hide();
      if (data.success == 1) {
        this.contact.name = '';
        this.contact.email = '';
        this.contact.message = '';
        this.shared.toast(data.message);
      }
    });
  };
  loadMap() {

    /* The create() function will take the ID of your map element */
    const map = GoogleMaps.create('map');

    map.one(GoogleMapsEvent.MAP_READY).then((data: any) => {
      const coordinates: LatLng = new LatLng(this.config.latitude, this.config.longitude);
      map.setCameraTarget(coordinates);
      map.setCameraZoom(15);
    });

    let marker: Marker = map.addMarkerSync({
      position: { lat: this.config.latitude, lng: this.config.longitude },
      title: this.config.address,
    })

  }
  ngOnInit() {
  }

}

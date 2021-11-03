import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { LoadingService } from 'src/providers/loading/loading.service';
import { UserAddressService } from 'src/providers/user-address/user-address.service';
import { GoogleMaps, GoogleMapsEvent, LatLng, Marker } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
})
export class GoogleMapComponent implements OnInit {


  @Input('page') page;
  @Output() locationUpdated: EventEmitter<any> = new EventEmitter();

  myLocation: any = {};
  constructor(
    public platform: Platform,
    public shared: SharedDataService,
    public loading: LoadingService,
    public userAddress: UserAddressService,
    private geolocation: Geolocation
  ) {
    //product data
    //this.data = this.shared.mapPageData;
    this.loading.show();
    let locationEnable = false
    this.userAddress.getCordinates().then(res => {
      locationEnable = true;
      this.loading.hide();
      this.myLocation = res;
      this.loadMap()
    });

    setTimeout(() => {
      if (locationEnable == false) {
        this.shared.showAlert("Please Turn On Device Location");
      }
    }, 10000);
  }
  loadMap() {
    if (this.page == "shipping") {
      if (this.shared.orderDetails.delivery_long != "") {
        this.myLocation.lat = this.shared.orderDetails.delivery_lat
        this.myLocation.long = this.shared.orderDetails.delivery_long
      }
    }

    if (this.page == "billing") {
      if (this.shared.orderDetails.billing_long != "") {
        this.myLocation.lat = this.shared.orderDetails.billing_lat
        this.myLocation.long = this.shared.orderDetails.billing_long
      }
    }

    /* The create() function will take the ID of your map element */
    const map = GoogleMaps.create('mapcomponent');

    map.one(GoogleMapsEvent.MAP_READY).then((data: any) => {
      const coordinates: LatLng = new LatLng(this.myLocation.lat, this.myLocation.long);

      map.setCameraTarget(coordinates);
      map.setCameraZoom(16);
    });

    let marker: Marker = map.addMarkerSync({
      position: { lat: this.myLocation.lat, lng: this.myLocation.long },
      title: "My Location",
      draggable: true,
    })

    let _this = this;

    marker.on(GoogleMapsEvent.MARKER_DRAG_END).subscribe(function (data) {
      if (_this.page == "shipping") {
        _this.shared.orderDetails.delivery_lat = data[0].lat
        _this.shared.orderDetails.delivery_long = data[0].lng
        _this.shared.orderDetails.delivery_location = data[0].lat + ", " + data[0].lng
        console.log(_this.shared.orderDetails.delivery_location);
      }
      if (_this.page == "billing") {
        _this.shared.orderDetails.billing_lat = data[0].lat
        _this.shared.orderDetails.billing_long = data[0].lng
        _this.shared.orderDetails.billing_location = data[0].lat + ", " + data[0].lng
      }
      console.log(data);
    });
  }

  setThisAddress() {
    this.locationUpdated.emit();
  }
  ngOnInit() { }

}

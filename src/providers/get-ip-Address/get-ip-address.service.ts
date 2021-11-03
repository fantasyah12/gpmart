import { Injectable } from '@angular/core';
import { NetworkInterface } from '@ionic-native/network-interface/ngx';
import { Platform } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class GetIpAddressService {
  public ipAddress = "";
  constructor(
    public platform: Platform,
    private networkInterface: NetworkInterface,
  ) {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        this.setRealIpAddress();
      }
    });
  }

  getIpAddress() {
    var ip;
    if (this.realIpAddressUpdatedCounter == 0) {
      var p1 = (Math.floor(Math.random() * 255) + 1);
      var p2 = (Math.floor(Math.random() * 255))
      var p3 = (Math.floor(Math.random() * 255));
      var p4 = (Math.floor(Math.random() * 255));
      ip = p1 + "." + p2 + "." + p3 + "." + p4;
    }
    else {
      ip = this.ipAddress;
    }
    return ip;
  }

  public realIpAddressUpdatedCounter = 0;

  setRealIpAddress() {
    this.networkInterface.getWiFiIPAddress()
      .then(address => {
        if (address.ip != undefined) {
          this.ipAddress = address.ip;
          this.realIpAddressUpdatedCounter++;
        }
      })
      .catch(error => {
        console.error(`Unable to get IP: ${error}`)
      });

    this.networkInterface.getCarrierIPAddress()
      .then(address => {
        if (address.ip != undefined) {
          this.ipAddress = address.ip;
          this.realIpAddressUpdatedCounter++;
        }
      })
      .catch(error => {
        console.error(`Unable to get IP: ${error}`)
      });
  }
}

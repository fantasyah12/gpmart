import { Injectable } from '@angular/core';
import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class GetDeviceIdService {
  deviceId: any = "";

  constructor(
    private uniqueDeviceID: UniqueDeviceID,
    public platform: Platform,
  ) {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        this.setRealDeviceId();
      }
    });
  }
  public realDeviceIdUpdatedCounter = 0;
  setRealDeviceId() {
    this.uniqueDeviceID.get()
      .then((uuid: any) => {
        this.deviceId = uuid;
        this.realDeviceIdUpdatedCounter++;
      })

      .catch((error: any) => {
        console.log(error)
      });
  }
  getDeviceId() {
    let id = "";
    if (this.realDeviceIdUpdatedCounter == 0) {
      let d = new Date();
      id = d.getTime().toString();
    }
    else {
      id = this.deviceId;
    }
    return id;
  }

}

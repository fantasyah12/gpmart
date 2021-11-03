import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { LoadingService } from '../loading/loading.service';
import { SharedDataService } from '../shared-data/shared-data.service';
import { AlertController } from '@ionic/angular';
import { AppEventsService } from '../app-events/app-events.service';
declare var window;
@Injectable({
  providedIn: 'root'
})
export class FirebasePhoneAuthService {

  constructor(
    public loading: LoadingService,
    public shared: SharedDataService,
    public alertController: AlertController,
    public appEventsService: AppEventsService,
  ) {

  }


  //=================================
  createRecaptcha() {
    let _this = this;
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('phone-login-in-button', {
      'size': 'invisible',
      'callback': function (response) {
        console.log(response);
      }
    });
  }


  //================================= function to verify send code
  verifyPhoneNumber(phoneNumber) {
    this.loading.show();
    let _this = this;
    firebase.auth().signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier).then(function (confirmationResult) {
      _this.loading.hide();
      _this.enterThePhoneCodeReceived(phoneNumber).then((data: any) => {

        if (data != null)
          confirmationResult.confirm(data).then((data: any) => {
            _this.loginAfterCodeVerify(phoneNumber);
          }).catch(
            (error) => {
              _this.shared.showAlert(data + " " + "Invalid Code Please try again.");
              console.log(error)
              //_this.errorMessage = error.message
            });
      })
    }).catch(
      (error) => {
        _this.loading.hide();
        console.log(error);
        _this.shared.showAlert(error.message + " " + phoneNumber);
      });
  }

  async enterThePhoneCodeReceived(phoneNumber) {
    return new Promise(resolve => {
      this.shared.translateArray(["Enter Sms Code You Received on", "Code", "Cancel", "ok"]).then(async (res: any) => {
        const alert = await this.alertController.create({
          header: res["Enter Sms Code You Received on"] + " " + phoneNumber,
          inputs: [
            {
              name: 'code',
              type: 'text',
              placeholder: res["Code"],
            }
          ],
          buttons: [
            {
              text: res["Cancel"],
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                resolve(null);
                console.log('Confirm Cancel');
              }
            }, {
              text: res["ok"],
              handler: (data) => {
                console.log(data);
                if (data.code == "")
                  this.enterThePhoneCodeReceived(phoneNumber).then(data => {
                    resolve(data);
                  })
                else
                  resolve(data.code);
              }
            }
          ]
        });

        await alert.present();
      });

    });

  }

  loginAfterCodeVerify(phoneNumber) {
    this.appEventsService.publish("loginWithPhoneNumber", phoneNumber);
  }
}

import { Component, OnInit, ApplicationRef } from '@angular/core';
import { ConfigService } from 'src/providers/config/config.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { LoadingService } from 'src/providers/loading/loading.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {

  myAccountData = {
    confirmPassword: '',
    newpassword: '',
    oldpassword: '',
    customers_id: '',
  };

  constructor(
    public config: ConfigService,
    public shared: SharedDataService,
    public loading: LoadingService) {
  }

  //============================================================================================  
  //function updating user information
  updatePassword() {
    if (this.myAccountData.confirmPassword != this.myAccountData.newpassword) {
      console.log(this.myAccountData.confirmPassword + "  " + this.myAccountData.newpassword);
      this.shared.toast("Confirm Password is Wrong!");
      return;
    }
    this.loading.show();
    let url = 'updatepassword?oldpassword=' + this.myAccountData.oldpassword +
      "&newpassword=" + this.myAccountData.newpassword +
      "&customers_id=" + this.shared.customerData.customers_id
    this.config.getHttp(url).then((data: any) => {
      this.loading.hide();
      if (data.success == 1) {
        let d = data.data[0];
        this.shared.toast(data.message);
        this.myAccountData.oldpassword = "";
        this.myAccountData.confirmPassword = "";
        this.myAccountData.newpassword = "";
      }
      else {
        this.shared.toast(data.message);
      }
    }
      , error => {
        this.loading.hide();
        this.shared.toast("Error while Updating!");
      });
    //}
  }

  ngOnInit() {
  }

}

import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/providers/config/config.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { LoadingService } from 'src/providers/loading/loading.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.page.html',
  styleUrls: ['./my-account.page.scss'],
})
export class MyAccountPage implements OnInit {

  myAccountData = {
    customers_firstname: '',
    customers_lastname: '',
    confirmPassword: '',
    newpassword: '',
    oldpassword: '',
    customers_dob: '',
    customers_id: '',
    image_id: 0,
    customers_telephone: ''
  };


  constructor(
    public config: ConfigService,
    public shared: SharedDataService,
    public loading: LoadingService) {
  }

  //============================================================================================  
  //function updating user information
  updateInfo() {
    console.log(this.shared.customerData);
    this.loading.show();
    this.myAccountData.customers_id = this.shared.customerData.customers_id;
    var dat = this.myAccountData;
    //  console.log("post data  "+JSON.stringify(data));
    this.config.postHttp('updatecustomerinfo', dat).then((data: any) => {
      this.loading.hide();
      if (data.success == 1) {
        //   document.getElementById("updateForm").reset();
        let d = data.data[0];
        this.shared.toast(data.message);
        // if (this.myAccountData.password != '')
        //   this.shared.customerData.password = this.myAccountData.password;
        console.log("data from server");
        console.log(d);
        this.shared.login(d);
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

  //============================================================================================

  ionViewWillEnter() {
    this.myAccountData.customers_firstname = this.shared.customerData.customers_firstname;
    this.myAccountData.customers_lastname = this.shared.customerData.customers_lastname;
    this.myAccountData.customers_telephone = this.shared.customerData.phone;
    //this.myAccountData.oldpassword = this.shared.customerData.password;
    //this.myAccountData.password = this.shared.customerData.password;
    try {
      // console.log(this.shared.customerData.customers_dob);
      this.myAccountData.customers_dob = new Date(this.shared.customerData.customers_dob).toISOString();
      // console.log(this.myAccountData.customers_dob);
    } catch (error) {
      this.myAccountData.customers_dob = new Date("1-1-2000").toISOString();
    }

  }

  ngOnInit() {
  }

}

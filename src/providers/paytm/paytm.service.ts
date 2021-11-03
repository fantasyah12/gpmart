import { Injectable } from '@angular/core';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { SharedDataService } from '../shared-data/shared-data.service';
@Injectable({
  providedIn: 'root'
})
export class PaytmService {

  constructor(
    public iab: InAppBrowser,
    public shared: SharedDataService) { }

  paytmpage(chcksum, orderId, mId, customerId, amount, inProduction) {
    return new Promise(resolve => {
      var paytmUrl = 'https://securegw-stage.paytm.in';
      if (inProduction == true)
        paytmUrl = 'https://securegw.paytm.in'

      var callBackUrl = paytmUrl + "/theia/paytmCallback?ORDER_ID=" + orderId;

      var completeUrl = paytmUrl + "/order/process";
      var pageContetn = `<html>
              <head>
                <title></title>
              </head>
              <body>
                <form method="post" action="${completeUrl}" name="paytm">
                    <table border="1">
                      <tbody>
                          <input type="hidden" name="MID" value="${mId}">
                          <input type="hidden" name="WEBSITE" value="WEBSTAGING">
                          <input type="hidden" name="ORDER_ID" value="${orderId}">
                          <input type="hidden" name="CUST_ID" value="${customerId}">
                          <input type="hidden" name="INDUSTRY_TYPE_ID" value="Retail">
                          <input type="hidden" name="CHANNEL_ID" value="WAP">
                          <input type="hidden" name="TXN_AMOUNT" value="${amount}">
                          <input type="hidden" name="CALLBACK_URL" value="${callBackUrl}">
                          <input type="hidden" name="CHECKSUMHASH" value="${chcksum}">
                      </tbody>
                    </table>
                    <script type="text/javascript">
                      document.paytm.submit();
                    </script>
                </form>
              </body>
          </html>`
      var pageContentUrl = "data:text/html;base64," + btoa(pageContetn);
      console.log(pageContentUrl)

      let options: InAppBrowserOptions = {
        location: 'yes',//Or 'no' 
        hidden: 'no', //Or  'yes'
        clearcache: 'yes',
        clearsessioncache: 'yes',
        zoom: 'no',//Android only ,shows browser zoom controls 
        disallowoverscroll: 'no', //iOS only 
        toolbar: 'yes', //iOS only  
        hideurlbar: "yes"
      };

      const bb = this.iab.create(pageContentUrl, "_blank", options)
      bb.on('loadstart').subscribe(res => {
        console.log(res.url);
        if (res.url == callBackUrl) {
          console.log("---------------- payment sucess ---------------");
          bb.close();
          resolve({ status: "sucess", id: orderId });
        }
      }), error => {
        console.log(error);
        resolve({ status: "error", error: error });
      };
    });
  }
}

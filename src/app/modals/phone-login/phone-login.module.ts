import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { PhoneLoginPage } from './phone-login.page';
import { PipesModule } from 'src/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule
  ],
  declarations: [PhoneLoginPage],
  entryComponents: [
    PhoneLoginPage
  ]
})
export class PhoneLoginPageModule { }

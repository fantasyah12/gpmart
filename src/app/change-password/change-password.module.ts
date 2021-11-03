import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChangePasswordPage } from './change-password.page';
import { RouterModule, Routes } from '@angular/router';
import { ShareModule } from 'src/components/share/share.module';
import { PipesModule } from 'src/pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: ChangePasswordPage
  }
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ShareModule,
    PipesModule
  ],
  declarations: [ChangePasswordPage]
})
export class ChangePasswordPageModule { }

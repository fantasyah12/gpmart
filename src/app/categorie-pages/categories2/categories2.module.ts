import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { Categories2Page } from './categories2.page';
import { PipesModule } from 'src/pipes/pipes.module';
import { ShareModule } from 'src/components/share/share.module';

const routes: Routes = [
  {
    path: '',
    component: Categories2Page
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PipesModule,
    ShareModule
  ],
  declarations: [Categories2Page]
})
export class Categories2PageModule {}

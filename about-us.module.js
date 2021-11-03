import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AboutUsPage } from './about-us.page';
// For Translation Language
import { TranslateModule } from '@ngx-translate/core';
const routes = [
    {
        path: '',
        component: AboutUsPage
    }
];
let AboutUsPageModule = class AboutUsPageModule {
};
AboutUsPageModule = tslib_1.__decorate([
    NgModule({
        imports: [
            CommonModule,
            FormsModule,
            IonicModule,
            RouterModule.forChild(routes),
            TranslateModule
        ],
        declarations: [AboutUsPage],
    })
], AboutUsPageModule);
export { AboutUsPageModule };
//# sourceMappingURL=about-us.module.js.map
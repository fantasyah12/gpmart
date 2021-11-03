import { Component, OnInit, Input } from '@angular/core';
import { ConfigService } from 'src/providers/config/config.service';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';

@Component({
  selector: 'app-no-category-found',
  templateUrl: './no-category-found.component.html',
  styleUrls: ['./no-category-found.component.scss'],
})
export class NoCategoryFoundComponent implements OnInit {
  @Input('data') data;//product data
  constructor(public shared: SharedDataService) {

  }

  ngOnInit() { }

}

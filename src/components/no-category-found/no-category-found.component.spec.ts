import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NoCategoryFoundComponent } from './no-category-found.component';

describe('NoCategoryFoundComponent', () => {
  let component: NoCategoryFoundComponent;
  let fixture: ComponentFixture<NoCategoryFoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoCategoryFoundComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NoCategoryFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

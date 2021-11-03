import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NoRecordFoundComponent } from './no-record-found.component';

describe('NoCategoryFoundComponent', () => {
  let component: NoRecordFoundComponent;
  let fixture: ComponentFixture<NoRecordFoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NoRecordFoundComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NoRecordFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

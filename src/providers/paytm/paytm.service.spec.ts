import { TestBed } from '@angular/core/testing';

import { PaytmService } from './paytm.service';

describe('PaytmService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PaytmService = TestBed.get(PaytmService);
    expect(service).toBeTruthy();
  });
});

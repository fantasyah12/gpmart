import { TestBed } from '@angular/core/testing';

import { GetIpAddressService } from './get-ip-address.service';

describe('GetIpAddressService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GetIpAddressService = TestBed.get(GetIpAddressService);
    expect(service).toBeTruthy();
  });
});

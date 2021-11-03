import { TestBed } from '@angular/core/testing';

import { GetDeviceIdService } from './get-device-id.service';

describe('GetDeviceIdService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GetDeviceIdService = TestBed.get(GetDeviceIdService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { FirebasePhoneAuthService } from './firebase-phone-auth.service';

describe('FirebasePhoneAuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FirebasePhoneAuthService = TestBed.get(FirebasePhoneAuthService);
    expect(service).toBeTruthy();
  });
});

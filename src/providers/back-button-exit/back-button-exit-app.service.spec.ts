import { TestBed } from '@angular/core/testing';

import { BackButtonExitAppService } from './back-button-exit-app.service';

describe('BackButtonExitAppService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BackButtonExitAppService = TestBed.get(BackButtonExitAppService);
    expect(service).toBeTruthy();
  });
});

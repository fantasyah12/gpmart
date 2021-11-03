import { TestBed } from '@angular/core/testing';

import { DeepLinkingService } from './deep-linking.service';

describe('DeepLinkingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DeepLinkingService = TestBed.get(DeepLinkingService);
    expect(service).toBeTruthy();
  });
});

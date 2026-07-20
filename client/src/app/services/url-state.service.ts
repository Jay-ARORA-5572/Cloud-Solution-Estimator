import { Injectable } from '@angular/core';
import { CloudProvider, EstimateRequest, ScaleTier } from '../models/estimate.model';

/**
 * Reads and writes the current estimate selection to/from the URL's query
 * string, so a link can be copied and reopened to reproduce the same
 * estimate without needing a backend to store anything.
 *
 * Deliberately uses plain window.history rather than Angular's Router —
 * this app has a single view, so a full router wasn't worth adding just
 * for query param handling.
 */
@Injectable({ providedIn: 'root' })
export class UrlStateService {
  readFromUrl(): Partial<EstimateRequest> | null {
    const params = new URLSearchParams(window.location.search);
    const workloadKey = params.get('workload');
    const cloud = params.get('cloud') as CloudProvider | null;
    const scale = params.get('scale') as ScaleTier | null;
    const services = params.get('services');
    const clientName = params.get('client');

    if (!workloadKey || !cloud || !scale || !services) {
      return null;
    }

    return {
      workloadKey,
      cloud,
      scale,
      services: services.split(',').filter(Boolean),
      clientName: clientName ? decodeURIComponent(clientName) : '',
    };
  }

  writeToUrl(request: EstimateRequest): void {
    const params = new URLSearchParams();
    if (request.workloadKey) params.set('workload', request.workloadKey);
    params.set('cloud', request.cloud);
    params.set('scale', request.scale);
    params.set('services', request.services.join(','));
    if (request.clientName) params.set('client', encodeURIComponent(request.clientName));

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }

  currentShareableLink(): string {
    return window.location.href;
  }
}

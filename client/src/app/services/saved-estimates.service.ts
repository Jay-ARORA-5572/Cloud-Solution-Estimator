import { Injectable } from '@angular/core';
import { EstimateRequest, EstimateResult } from '../models/estimate.model';

export interface SavedEstimate {
  id: string;
  label: string; // clientName, or a fallback like "Untitled estimate"
  request: EstimateRequest;
  result: EstimateResult;
  savedAt: string; // ISO timestamp
}

const STORAGE_KEY = 'cse.savedEstimates';

/**
 * Persists saved estimates to localStorage so a page refresh (or coming
 * back tomorrow) doesn't lose work. There's no backend database for this
 * app by design (see README), so the browser is the only place state can
 * live between visits.
 */
@Injectable({ providedIn: 'root' })
export class SavedEstimatesService {
  list(): SavedEstimate[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as SavedEstimate[];
    } catch {
      return [];
    }
  }

  save(request: EstimateRequest, result: EstimateResult): SavedEstimate {
    const saved: SavedEstimate = {
      id: `${Date.now()}`,
      label: request.clientName?.trim() || 'Untitled estimate',
      request,
      result,
      savedAt: new Date().toISOString(),
    };
    const all = [saved, ...this.list()].slice(0, 20); // cap history at 20
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return saved;
  }

  remove(id: string): void {
    const remaining = this.list().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  }
}

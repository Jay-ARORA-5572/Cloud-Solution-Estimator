import { Injectable } from '@angular/core';
import { Deal, DealStage } from '../models/deal.model';

const STORAGE_KEY = 'cse.deals';

/**
 * Client-side deal tracker — logs prospects, their workload, and pipeline
 * stage. Kept simple and local (localStorage) rather than backed by the
 * Express API, since a real CRM integration is out of scope for a
 * portfolio project like this one.
 */
@Injectable({ providedIn: 'root' })
export class DealTrackerService {
  list(): Deal[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Deal[];
    } catch {
      return [];
    }
  }

  add(deal: Omit<Deal, 'id' | 'createdAt'>): Deal {
    const newDeal: Deal = {
      ...deal,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const all = [newDeal, ...this.list()];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return newDeal;
  }

  updateStage(id: string, stage: DealStage): void {
    const all = this.list().map((d) => (d.id === id ? { ...d, stage } : d));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  remove(id: string): void {
    const remaining = this.list().filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  }
}

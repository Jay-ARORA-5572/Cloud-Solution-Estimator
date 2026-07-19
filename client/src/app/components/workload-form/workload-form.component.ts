import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Catalog,
  CloudProvider,
  EstimateRequest,
  ScaleTier,
  ServicePricing,
} from '../../models/estimate.model';

@Component({
  selector: 'app-workload-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workload-form.component.html',
  styleUrl: './workload-form.component.css',
})
export class WorkloadFormComponent implements OnChanges {
  @Input() catalog: Catalog | null = null;
  @Output() formChange = new EventEmitter<EstimateRequest>();

  clientName = '';
  notes = '';
  cloud: CloudProvider = 'AWS';
  scale: ScaleTier = 'medium';
  workloadKey: string | null = null;
  selectedServices = new Set<string>();

  clouds: CloudProvider[] = ['AWS', 'GCP'];
  scales: ScaleTier[] = ['small', 'medium', 'large'];

  ngOnChanges(changes: SimpleChanges): void {
    // Runs once the catalog has been fetched from the backend. Pick the
    // first workload as a sensible default so the page isn't empty on load.
    if (changes['catalog'] && this.catalog && !this.workloadKey) {
      const firstKey = Object.keys(this.catalog.workloads)[0];
      this.selectWorkload(firstKey);
    }
  }

  get workloadKeys(): string[] {
    return this.catalog ? Object.keys(this.catalog.workloads) : [];
  }

  get servicesForCloud(): [string, ServicePricing][] {
    if (!this.catalog) return [];
    return Object.entries(this.catalog.pricing[this.cloud]);
  }

  get workloadHint(): string {
    if (!this.catalog || !this.workloadKey) return '';
    return this.catalog.workloads[this.workloadKey].description;
  }

  selectWorkload(key: string): void {
    this.workloadKey = key;
    const workload = this.catalog!.workloads[key];
    this.selectedServices = new Set(workload.recommended[this.cloud]);
    this.emitChange();
  }

  selectCloud(cloud: CloudProvider): void {
    this.cloud = cloud;
    if (this.workloadKey) {
      const workload = this.catalog!.workloads[this.workloadKey];
      this.selectedServices = new Set(workload.recommended[cloud]);
    }
    this.emitChange();
  }

  selectScale(scale: ScaleTier): void {
    this.scale = scale;
    this.emitChange();
  }

  toggleService(key: string): void {
    if (this.selectedServices.has(key)) {
      this.selectedServices.delete(key);
    } else {
      this.selectedServices.add(key);
    }
    this.emitChange();
  }

  isChecked(key: string): boolean {
    return this.selectedServices.has(key);
  }

  emitChange(): void {
    this.formChange.emit({
      cloud: this.cloud,
      scale: this.scale,
      services: Array.from(this.selectedServices),
      workloadKey: this.workloadKey,
      clientName: this.clientName.trim(),
      notes: this.notes.trim(),
    });
  }
}

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
  // Lets a parent push in a starting selection — used both to restore a
  // shared URL link and to load a previously saved estimate.
  @Input() externalState: Partial<EstimateRequest> | null = null;
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
    if (this.catalog && !this.workloadKey) {
      // First time the catalog is available — apply a URL/saved state if
      // one was provided, otherwise fall back to the first workload.
      this.applyState(this.externalState ?? {});
    } else if (changes['externalState'] && this.externalState && this.catalog) {
      // Form is already initialized — this is an explicit "load saved
      // estimate" (or similar) action from the parent.
      this.applyState(this.externalState);
    }
  }

  private applyState(state: Partial<EstimateRequest>): void {
    if (!this.catalog) return;
    const key = state.workloadKey ?? this.workloadKey ?? Object.keys(this.catalog.workloads)[0];
    this.workloadKey = key;
    this.cloud = state.cloud ?? this.cloud;
    this.scale = state.scale ?? this.scale;
    this.clientName = state.clientName ?? this.clientName;
    const workload = this.catalog.workloads[key];
    this.selectedServices = new Set(
      state.services && state.services.length ? state.services : workload.recommended[this.cloud]
    );
    this.emitChange();
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

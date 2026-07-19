import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstimatorApiService } from './services/estimator-api.service';
import { Catalog, EstimateRequest, EstimateResult } from './models/estimate.model';
import { WorkloadFormComponent } from './components/workload-form/workload-form.component';
import { ArchitectureDiagramComponent } from './components/architecture-diagram/architecture-diagram.component';
import { CostTableComponent } from './components/cost-table/cost-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, WorkloadFormComponent, ArchitectureDiagramComponent, CostTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  catalog: Catalog | null = null;
  estimate: EstimateResult | null = null;
  currentRequest: EstimateRequest | null = null;
  status: 'draft' | 'calculating' | 'ready' | 'error' = 'draft';

  constructor(private api: EstimatorApiService) {}

  ngOnInit(): void {
    this.api.getCatalog().subscribe((data) => {
      this.catalog = data;
    });
  }

  get statusLabel(): string {
    switch (this.status) {
      case 'calculating': return 'Calculating…';
      case 'ready': return 'Ready';
      case 'error': return 'Error';
      default: return 'Draft';
    }
  }

  onFormChange(request: EstimateRequest): void {
    this.currentRequest = request;

    if (request.services.length === 0) {
      this.estimate = null;
      this.status = 'draft';
      return;
    }

    this.status = 'calculating';
    this.api.getEstimate(request).subscribe({
      next: (result) => {
        this.estimate = result;
        this.status = 'ready';
      },
      error: () => {
        this.status = 'error';
      },
    });
  }

  exportPdf(): void {
    if (!this.currentRequest || this.currentRequest.services.length === 0) {
      alert('Select at least one service before exporting.');
      return;
    }
    this.api.exportPdf(this.currentRequest).subscribe((blob) => {
      this.downloadBlob(blob, 'cloud-solution-proposal.pdf');
    });
  }

  exportExcel(): void {
    if (!this.currentRequest || this.currentRequest.services.length === 0) {
      alert('Select at least one service before exporting.');
      return;
    }
    this.api.exportExcel(this.currentRequest).subscribe((blob) => {
      this.downloadBlob(blob, 'cloud-cost-estimate.xlsx');
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstimatorApiService } from './services/estimator-api.service';
import { UrlStateService } from './services/url-state.service';
import { SavedEstimatesService, SavedEstimate } from './services/saved-estimates.service';
import { Catalog, EstimateRequest, EstimateResult } from './models/estimate.model';
import { DiscoveryQuestion } from './models/discovery.model';
import { WorkloadFormComponent } from './components/workload-form/workload-form.component';
import { CostTableComponent } from './components/cost-table/cost-table.component';
import { DiscoveryQuestionnaireComponent } from './components/discovery-questionnaire/discovery-questionnaire.component';
import { DealTrackerComponent } from './components/deal-tracker/deal-tracker.component';
import { ProviderComparisonComponent } from './components/provider-comparison/provider-comparison.component';

type TabId = 'estimator' | 'discovery' | 'deals' | 'compare';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    WorkloadFormComponent,
    CostTableComponent,
    DiscoveryQuestionnaireComponent,
    DealTrackerComponent,
    ProviderComparisonComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  activeTab: TabId = 'estimator';

  catalog: Catalog | null = null;
  estimate: EstimateResult | null = null;
  currentRequest: EstimateRequest | null = null;
  status: 'draft' | 'calculating' | 'ready' | 'error' = 'draft';

  // Populated once from the URL on load; passed into the form as its
  // starting selection, then reused whenever "load saved estimate" fires.
  externalState: Partial<EstimateRequest> | null = null;

  savedEstimates: SavedEstimate[] = [];
  linkCopied = false;
  estimateSaved = false;

  constructor(
    private api: EstimatorApiService,
    private urlState: UrlStateService,
    private savedEstimatesService: SavedEstimatesService
  ) {}

  ngOnInit(): void {
    this.externalState = this.urlState.readFromUrl();
    this.savedEstimates = this.savedEstimatesService.list();
    this.api.getCatalog().subscribe((data) => {
      this.catalog = data;
    });
  }

  setTab(tab: TabId): void {
    this.activeTab = tab;
  }

  get statusLabel(): string {
    switch (this.status) {
      case 'calculating': return 'Calculating…';
      case 'ready': return 'Ready';
      case 'error': return 'Error';
      default: return 'Draft';
    }
  }

  get currentWorkloadLabel(): string {
    if (!this.catalog || !this.currentRequest?.workloadKey) return '';
    return this.catalog.workloads[this.currentRequest.workloadKey]?.label ?? '';
  }

  get currentDiscoveryQuestions(): string[] {
    if (!this.catalog || !this.currentRequest?.workloadKey) return [];
    return this.catalog.workloads[this.currentRequest.workloadKey]?.discoveryQuestions ?? [];
  }

  onFormChange(request: EstimateRequest): void {
    this.currentRequest = request;
    this.urlState.writeToUrl(request);

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

  exportDiscoveryNotes(questions: DiscoveryQuestion[]): void {
    if (!this.currentRequest?.workloadKey) return;
    this.api
      .exportDiscoveryPdf({
        workloadKey: this.currentRequest.workloadKey,
        clientName: this.currentRequest.clientName,
        questions,
      })
      .subscribe((blob) => {
        this.downloadBlob(blob, 'discovery-call-notes.pdf');
      });
  }

  copyShareableLink(): void {
    navigator.clipboard.writeText(this.urlState.currentShareableLink()).then(() => {
      this.linkCopied = true;
      setTimeout(() => (this.linkCopied = false), 2000);
    });
  }

  saveEstimate(): void {
    if (!this.currentRequest || !this.estimate) return;
    this.savedEstimatesService.save(this.currentRequest, this.estimate);
    this.savedEstimates = this.savedEstimatesService.list();
    this.estimateSaved = true;
    setTimeout(() => (this.estimateSaved = false), 2000);
  }

  loadSavedEstimate(saved: SavedEstimate): void {
    // New object reference so the form's ngOnChanges reliably fires even
    // if the same saved estimate is loaded twice in a row.
    this.externalState = { ...saved.request };
  }

  removeSavedEstimate(saved: SavedEstimate, event: Event): void {
    event.stopPropagation();
    this.savedEstimatesService.remove(saved.id);
    this.savedEstimates = this.savedEstimatesService.list();
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

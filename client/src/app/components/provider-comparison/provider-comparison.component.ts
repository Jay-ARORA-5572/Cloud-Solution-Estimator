import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { EstimatorApiService } from '../../services/estimator-api.service';
import { ComparisonResult, ScaleTier } from '../../models/estimate.model';

@Component({
  selector: 'app-provider-comparison',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './provider-comparison.component.html',
  styleUrl: './provider-comparison.component.css',
})
export class ProviderComparisonComponent implements OnChanges {
  @Input() workloadKey: string | null = null;
  @Input() workloadLabel = '';
  @Input() scale: ScaleTier = 'medium';

  result: ComparisonResult | null = null;
  loading = false;

  constructor(private api: EstimatorApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['workloadKey'] || changes['scale']) && this.workloadKey) {
      this.fetchComparison();
    }
  }

  private fetchComparison(): void {
    this.loading = true;
    this.api.compare({ workloadKey: this.workloadKey!, scale: this.scale }).subscribe({
      next: (result) => {
        this.result = result;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}

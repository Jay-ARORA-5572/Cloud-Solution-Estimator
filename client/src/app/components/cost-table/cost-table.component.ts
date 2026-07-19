import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { EstimateResult } from '../../models/estimate.model';

@Component({
  selector: 'app-cost-table',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './cost-table.component.html',
  styleUrl: './cost-table.component.css',
})
export class CostTableComponent {
  @Input() estimate: EstimateResult | null = null;
}

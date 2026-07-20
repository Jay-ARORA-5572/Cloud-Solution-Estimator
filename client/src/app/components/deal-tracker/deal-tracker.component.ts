import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Deal, DealStage } from '../../models/deal.model';
import { DealTrackerService } from '../../services/deal-tracker.service';

@Component({
  selector: 'app-deal-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deal-tracker.component.html',
  styleUrl: './deal-tracker.component.css',
})
export class DealTrackerComponent implements OnInit {
  // Prefill fields, passed down from the currently configured estimate so
  // "Add current estimate as deal" doesn't require retyping anything.
  @Input() prefillClientName = '';
  @Input() prefillWorkloadKey = '';
  @Input() prefillWorkloadLabel = '';
  @Input() prefillMonthlyTotal: number | null = null;

  deals: Deal[] = [];
  stages: DealStage[] = ['Discovery', 'Proposal Sent', 'Won', 'Lost'];

  newClientName = '';

  constructor(private dealService: DealTrackerService) {}

  ngOnInit(): void {
    this.deals = this.dealService.list();
  }

  addFromEstimate(): void {
    if (!this.prefillWorkloadKey) return;
    this.dealService.add({
      clientName: this.prefillClientName || 'Unnamed prospect',
      workloadKey: this.prefillWorkloadKey,
      workloadLabel: this.prefillWorkloadLabel,
      monthlyTotal: this.prefillMonthlyTotal,
      stage: 'Discovery',
    });
    this.deals = this.dealService.list();
  }

  addManual(): void {
    const name = this.newClientName.trim();
    if (!name) return;
    this.dealService.add({
      clientName: name,
      workloadKey: '',
      workloadLabel: 'Not scoped yet',
      monthlyTotal: null,
      stage: 'Discovery',
    });
    this.newClientName = '';
    this.deals = this.dealService.list();
  }

  updateStage(deal: Deal, stage: DealStage): void {
    this.dealService.updateStage(deal.id, stage);
    deal.stage = stage;
  }

  remove(deal: Deal): void {
    this.dealService.remove(deal.id);
    this.deals = this.deals.filter((d) => d.id !== deal.id);
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudProvider, EstimateLineItem } from '../../models/estimate.model';

@Component({
  selector: 'app-architecture-diagram',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './architecture-diagram.component.html',
  styleUrl: './architecture-diagram.component.css',
})
export class ArchitectureDiagramComponent {
  @Input() lineItems: EstimateLineItem[] = [];
  @Input() cloud: CloudProvider = 'AWS';

  get cloudClass(): string {
    return this.cloud === 'AWS' ? 'aws' : 'gcp';
  }
}

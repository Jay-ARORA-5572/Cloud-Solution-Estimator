import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiscoveryQuestion } from '../../models/discovery.model';

@Component({
  selector: 'app-discovery-questionnaire',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './discovery-questionnaire.component.html',
  styleUrl: './discovery-questionnaire.component.css',
})
export class DiscoveryQuestionnaireComponent implements OnChanges {
  @Input() workloadLabel = '';
  @Input() baseQuestions: string[] = [];
  @Output() exportRequested = new EventEmitter<DiscoveryQuestion[]>();

  questions: DiscoveryQuestion[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    // Reset notes whenever the underlying workload's question set changes
    // (switching workload in the Estimator tab), but keep whatever the user
    // already typed if this fires for an unrelated reason.
    if (changes['baseQuestions']) {
      this.questions = this.baseQuestions.map((q) => ({ question: q, notes: '' }));
    }
  }

  export(): void {
    this.exportRequested.emit(this.questions);
  }
}

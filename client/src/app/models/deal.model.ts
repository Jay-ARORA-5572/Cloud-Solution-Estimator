export type DealStage = 'Discovery' | 'Proposal Sent' | 'Won' | 'Lost';

export interface Deal {
  id: string;
  clientName: string;
  workloadKey: string;
  workloadLabel: string;
  monthlyTotal: number | null;
  stage: DealStage;
  createdAt: string; // ISO timestamp
}

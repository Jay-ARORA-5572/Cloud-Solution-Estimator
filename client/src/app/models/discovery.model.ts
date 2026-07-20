export interface DiscoveryQuestion {
  question: string;
  notes: string;
}

export interface DiscoveryExportRequest {
  workloadKey: string;
  clientName?: string;
  questions: DiscoveryQuestion[];
}

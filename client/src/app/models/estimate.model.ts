export interface ServicePricing {
  label: string;
  desc: string;
  small: number;
  medium: number;
  large: number;
}

export interface WorkloadTemplate {
  label: string;
  description: string;
  recommended: {
    AWS: string[];
    GCP: string[];
  };
  discoveryQuestions: string[];
}

export interface Catalog {
  pricing: {
    AWS: Record<string, ServicePricing>;
    GCP: Record<string, ServicePricing>;
  };
  workloads: Record<string, WorkloadTemplate>;
}

export type CloudProvider = 'AWS' | 'GCP';
export type ScaleTier = 'small' | 'medium' | 'large';

export interface EstimateLineItem {
  key: string;
  label: string;
  desc: string;
  monthlyCost: number;
}

export interface EstimateResult {
  cloud: CloudProvider;
  scale: ScaleTier;
  workload: { key: string; label: string; description: string } | null;
  lineItems: EstimateLineItem[];
  monthlyTotal: number;
  annualTotal: number;
}

export interface EstimateRequest {
  cloud: CloudProvider;
  scale: ScaleTier;
  services: string[];
  workloadKey: string | null;
  clientName?: string;
  notes?: string;
}

export interface ComparisonRequest {
  workloadKey: string;
  scale: ScaleTier;
}

export interface ComparisonResult {
  workload: WorkloadTemplate & { key: string };
  scale: ScaleTier;
  aws: EstimateResult;
  gcp: EstimateResult;
  cheaper: 'AWS' | 'GCP' | 'tie';
  monthlyDifference: number;
}

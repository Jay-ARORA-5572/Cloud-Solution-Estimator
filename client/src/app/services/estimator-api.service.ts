import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Catalog, EstimateRequest, EstimateResult } from '../models/estimate.model';

@Injectable({ providedIn: 'root' })
export class EstimatorApiService {
  // Requests are relative — the Angular build output is served by the same
  // Express app that exposes /api, so no base URL or CORS setup is needed.
  private readonly baseUrl = '/api';

  constructor(private http: HttpClient) {}

  getCatalog(): Observable<Catalog> {
    return this.http.get<Catalog>(`${this.baseUrl}/catalog`);
  }

  getEstimate(payload: EstimateRequest): Observable<EstimateResult> {
    return this.http.post<EstimateResult>(`${this.baseUrl}/estimate`, payload);
  }

  exportPdf(payload: EstimateRequest): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/export/pdf`, payload, { responseType: 'blob' });
  }

  exportExcel(payload: EstimateRequest): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/export/excel`, payload, { responseType: 'blob' });
  }
}

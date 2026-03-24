import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Consultant,
  CreateConsultantRequest,
  UpdateConsultantRequest
} from '../models/consultant.model';

@Injectable({ providedIn: 'root' })
export class ConsultantApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/consultants';

  getAll(): Observable<Consultant[]> {
    return this.http.get<Consultant[]>(this.baseUrl);
  }

  create(payload: CreateConsultantRequest): Observable<Consultant> {
    return this.http.post<Consultant>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateConsultantRequest): Observable<Consultant> {
    return this.http.patch<Consultant>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

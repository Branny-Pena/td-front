import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StartSurveyResponseDto, SubmitSurveyAnswersDto, SurveyResponse, SurveyResponseStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class SurveyResponseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/survey-responses';

  listAll(filters?: { status?: SurveyResponseStatus; surveyId?: string; surveyVersionId?: string }): Observable<SurveyResponse[]> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.surveyId) params = params.set('surveyId', filters.surveyId);
    if (filters?.surveyVersionId) params = params.set('surveyVersionId', filters.surveyVersionId);
    return this.http.get<SurveyResponse[]>(this.baseUrl, { params });
  }

  start(dto: StartSurveyResponseDto): Observable<SurveyResponse> {
    return this.http.post<SurveyResponse>(this.baseUrl, dto);
  }

  getById(id: string): Observable<SurveyResponse> {
    return this.http.get<SurveyResponse>(`${this.baseUrl}/${id}`);
  }

  submitAnswers(responseId: string, dto: SubmitSurveyAnswersDto): Observable<SurveyResponse> {
    return this.http.post<SurveyResponse>(`${this.baseUrl}/${responseId}/answers`, dto);
  }
}


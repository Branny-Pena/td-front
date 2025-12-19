import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateSurveyQuestionDto, CreateSurveyVersionDto, SurveyVersion } from '../models';

@Injectable({ providedIn: 'root' })
export class SurveyVersionService {
  private readonly http = inject(HttpClient);

  createForSurvey(surveyId: string, dto: CreateSurveyVersionDto): Observable<SurveyVersion> {
    return this.http.post<SurveyVersion>(`/surveys/${surveyId}/versions`, dto);
  }

  listForSurvey(surveyId: string): Observable<SurveyVersion[]> {
    return this.http.get<SurveyVersion[]>(`/surveys/${surveyId}/versions`);
  }

  getCurrentForSurvey(surveyId: string): Observable<SurveyVersion> {
    return this.http.get<SurveyVersion>(`/surveys/${surveyId}/versions/current`);
  }

  getFullVersion(versionId: string): Observable<SurveyVersion> {
    return this.http.get<SurveyVersion>(`/survey-versions/${versionId}`);
  }

  addQuestion(versionId: string, dto: CreateSurveyQuestionDto): Observable<unknown> {
    return this.http.post(`/survey-versions/${versionId}/questions`, dto);
  }
}


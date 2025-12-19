import { TestDriveForm } from './test-drive-form.model';
import { SurveyQuestionOption, SurveyQuestion, SurveyVersion } from './survey-version.model';

export type SurveyResponseStatus = 'started' | 'submitted';

export interface SurveyAnswer {
  id: string;
  valueNumber: number | null;
  valueText: string | null;
  question: SurveyQuestion;
  option: SurveyQuestionOption | null;
}

export interface SurveyResponse {
  id: string;
  status: SurveyResponseStatus;
  submittedAt: string | null;
  surveyVersion: SurveyVersion;
  testDriveForm: TestDriveForm;
  answers: SurveyAnswer[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StartSurveyResponseDto {
  surveyVersionId: string;
  testDriveFormIdentifier: string;
}

export interface SubmitSurveyAnswerItemDto {
  questionId: string;
  valueNumber?: number;
  valueText?: string;
  optionIds?: string[];
}

export interface SubmitSurveyAnswersDto {
  answers: SubmitSurveyAnswerItemDto[];
}


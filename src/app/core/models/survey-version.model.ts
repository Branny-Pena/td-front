import { Survey } from './survey.model';

export type SurveyQuestionType = 'number' | 'text' | 'option_single' | 'option_multi';

export interface SurveyVersion {
  id: string;
  version: number;
  isCurrent: boolean;
  notes: string | null;
  survey?: Survey;
  questions?: SurveyQuestion[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSurveyVersionDto {
  version: number;
  isCurrent?: boolean;
  notes?: string;
}

export interface SurveyQuestionOption {
  id: string;
  label: string;
  value: string;
  orderIndex: number;
}

export interface SurveyQuestion {
  id: string;
  type: SurveyQuestionType;
  label: string;
  isRequired: boolean;
  orderIndex: number;
  minValue: number | null;
  maxValue: number | null;
  options?: SurveyQuestionOption[];
}

export interface CreateSurveyQuestionOptionDto {
  label: string;
  value: string;
  orderIndex?: number;
}

export interface CreateSurveyQuestionDto {
  type: SurveyQuestionType;
  label: string;
  isRequired: boolean;
  orderIndex: number;
  minValue?: number;
  maxValue?: number;
  options?: CreateSurveyQuestionOptionDto[];
}


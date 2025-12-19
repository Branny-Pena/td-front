export type SurveyBrand = 'MERCEDES-BENZ' | 'ANDES MOTOR' | 'STELLANTIS';
export type SurveyStatus = 'draft' | 'ready';

export interface Survey {
  id: string;
  name: string;
  brand: SurveyBrand;
  isActive: boolean;
  status: SurveyStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSurveyDto {
  name: string;
  brand: SurveyBrand;
}

export interface UpdateSurveyDto {
  name?: string;
  brand?: SurveyBrand;
  isActive?: boolean;
  status?: SurveyStatus;
}

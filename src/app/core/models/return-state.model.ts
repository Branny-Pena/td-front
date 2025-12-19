import { Image } from './image.model';

export interface ReturnState {
  id: string;
  finalMileage: number;
  fuelLevelPercentage: number;
  images: Image[];
}

export interface CreateReturnStateDto {
  finalMileage: number;
  fuelLevelPercentage: number;
  images: string[];
}

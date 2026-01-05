import { Image } from './image.model';

export interface ReturnState {
  id: string;
  mileageImage: Image;
  fuelLevelImage: Image;
  images: Image[];
}

export interface CreateReturnStateDto {
  mileageImageUrl: string;
  fuelLevelImageUrl: string;
  images?: string[];
}

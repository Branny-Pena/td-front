export interface Image {
  id: string;
  url: string;
  role?: 'mileage' | 'fuel_level' | 'vehicle';
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  phoneNumber: string | null;
  email: string | null;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  dni: string;
  phoneNumber?: string;
  email?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  dni?: string;
  phoneNumber?: string;
  email?: string;
}

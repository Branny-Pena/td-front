import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Customer, CreateUserDto, UpdateUserDto } from '../models';

interface FindOrCreateUserResponse {
  customer: Customer;
  created: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/customers';

  create(dto: CreateUserDto): Observable<Customer> {
    return this.http
      .post<FindOrCreateUserResponse>(`${this.baseUrl}/find-or-create`, dto)
      .pipe(map((res) => res.customer));
  }

  getById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}/${id}`);
  }

  getByDni(dni: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}?dni=${encodeURIComponent(dni)}`);
  }

  update(id: string, dto: UpdateUserDto): Observable<Customer> {
    return this.http.patch<Customer>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

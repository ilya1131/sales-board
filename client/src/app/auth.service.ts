import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  constructor(private http: HttpClient) { }

  registerUser (user: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, user);
  }

  loginUser (user: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, user);
  }

  logout () {
    return this.http.delete<any>(`${this.apiUrl}/logout`);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLogedIn () {
    return !!this.getToken();
  }
}
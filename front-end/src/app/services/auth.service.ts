import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5180/api/auth'; // Ensure this matches standard dotnet run URLs (typically 5000, 5242 or similar)

  // Signals for reactive state
  readonly currentUser = signal<{ username: string; email: string; userId: number } | null>(null);
  readonly token = signal<string | null>(null);

  constructor() {
    this.loadUserFromStorage();
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, email, password });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        this.saveUser(res);
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUser.set(null);
    this.token.set(null);
  }

  getHeaders() {
    return {
      headers: {
        'Authorization': `Bearer ${this.token()}`
      }
    };
  }

  isLoggedIn(): boolean {
    return this.token() !== null;
  }

  private saveUser(res: AuthResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify({ username: res.username, email: res.email, userId: res.userId }));
    }
    this.token.set(res.token);
    this.currentUser.set({ username: res.username, email: res.email, userId: res.userId });
  }

  private loadUserFromStorage(): void {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        this.token.set(storedToken);
        this.currentUser.set(JSON.parse(storedUser));
      }
    }
  }
}

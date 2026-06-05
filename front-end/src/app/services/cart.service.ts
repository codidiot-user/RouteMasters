import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

export interface CartItem {
  id: number;
  itemId: number;
  quantity: number;
  itemName: string;
  price: number;
  category: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = 'http://localhost:5180/api/cart';

  readonly cartItems = signal<CartItem[]>([]);

  loadCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl, this.auth.getHeaders()).pipe(
      tap(items => this.cartItems.set(items))
    );
  }

  addToCart(itemId: number, quantity: number = 1): Observable<any> {
    return this.http.post(this.apiUrl, { itemId, quantity }, this.auth.getHeaders()).pipe(
      tap(() => this.loadCart().subscribe())
    );
  }

  removeFromCart(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.auth.getHeaders()).pipe(
      tap(() => this.loadCart().subscribe())
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear`, this.auth.getHeaders()).pipe(
      tap(() => this.cartItems.set([]))
    );
  }
}

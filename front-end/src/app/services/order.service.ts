import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface OrderItem {
  id: number;
  itemId: number;
  itemName: string;
  price: number;
  quantity: number;
  category: string;
}

export interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  items: OrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = 'http://localhost:5180/api/orders';

  readonly directBooking = signal<{ itemId: number; name: string; price: number; quantity: number } | null>(null);

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl, this.auth.getHeaders());
  }

  placeOrder(paymentMethod: string, isFromCart: boolean, directItem?: { itemId: number; quantity: number }): Observable<any> {
    const payload = {
      paymentMethod,
      isFromCart,
      directItem
    };
    return this.http.post(this.apiUrl, payload, this.auth.getHeaders());
  }

  cancelOrder(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/cancel`, {}, this.auth.getHeaders());
  }
}

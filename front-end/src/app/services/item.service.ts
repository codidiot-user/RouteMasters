import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5180/api/items';

  getItems(category?: string): Observable<Item[]> {
    const url = category ? `${this.apiUrl}?category=${encodeURIComponent(category)}` : this.apiUrl;
    return this.http.get<Item[]>(url);
  }

  searchItems(query: string, category?: string): Observable<Item[]> {
    let url = `${this.apiUrl}/search?query=${encodeURIComponent(query)}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    return this.http.get<Item[]>(url);
  }
}

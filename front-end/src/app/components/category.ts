import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Item, ItemService } from '../services/item.service';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- Category Header -->
      <div class="category-banner animate-fade-in">
        <a routerLink="/home" class="btn-back">← Back to Categories</a>
        <h1 class="category-heading">
          Explore <span class="highlight">{{ categoryName() }}</span>
        </h1>
        <p class="category-sub">Browsing fresh items curated for you</p>
      </div>

      <!-- Search Section -->
      <div class="search-bar-container glass-card animate-fade-in" style="animation-delay: 100ms;">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Search items in this category..." 
          class="search-input"
          [(ngModel)]="searchQuery"
          (input)="onSearchChange()"
        />
        <button class="btn btn-primary" (click)="triggerSearch()">Search</button>
      </div>

      <!-- Items Section -->
      <div class="loading-state" *ngIf="loading()">
        <div class="loader"></div>
        <p>Loading items...</p>
      </div>

      <div class="empty-state glass-card animate-fade-in" *ngIf="!loading() && items().length === 0">
        <span class="empty-icon">🍽️</span>
        <h3>No Items Found</h3>
        <p>We couldn't find any items matching your search. Try adjusting your query!</p>
      </div>

      <div class="items-grid" *ngIf="!loading() && items().length > 0">
        <div 
          *ngFor="let item of items(); let i = index" 
          class="item-card glass-card animate-slide-up"
          [style.animation-delay]="(i * 50) + 'ms'"
        >
          <!-- Fallback glowing gradient card banner -->
          <div class="item-visual" [style.background]="getVisualGradient(item.category)">
            <span class="item-emoji">{{ getEmoji(item.category) }}</span>
            <span class="item-category-tag">{{ item.category }}</span>
          </div>

          <div class="item-content">
            <div class="item-header">
              <h3 class="item-title">{{ item.name }}</h3>
              <span class="item-price">\${{ item.price.toFixed(2) }}</span>
            </div>
            <p class="item-desc">{{ item.description }}</p>
          </div>

          <div class="item-actions">
            <button class="btn btn-secondary w-full-btn" (click)="bookOrder(item)">
              ⚡ Book Order
            </button>
            <button class="btn btn-outline w-full-btn" (click)="addToCart(item)" [disabled]="addingMap[item.id]">
              🛒 {{ addingMap[item.id] ? 'Adding...' : 'Add to Cart' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Micro toast notification -->
    <div class="toast animate-fade-in" *ngIf="toastMessage()">
      <span class="toast-icon">✓</span>
      <span class="toast-text">{{ toastMessage() }}</span>
    </div>
  `,
  styles: [`
    .category-banner {
      margin-bottom: 30px;
    }
    
    .btn-back {
      color: #00f2fe;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      transition: opacity 0.2s;
    }
    
    .btn-back:hover {
      opacity: 0.8;
    }
    
    .category-heading {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 2.5rem;
      color: #fff;
      margin-top: 10px;
      margin-bottom: 6px;
    }
    
    .category-heading .highlight {
      background: linear-gradient(135deg, #8a2be2, #00f2fe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .category-sub {
      color: #a39eb9;
      font-size: 1rem;
    }
    
    .search-bar-container {
      display: flex;
      gap: 15px;
      padding: 15px 25px;
      align-items: center;
      margin-bottom: 40px;
      border-radius: 12px;
    }
    
    .search-icon {
      font-size: 1.2rem;
    }
    
    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      color: #fff;
      font-size: 1rem;
      outline: none;
    }
    
    .loading-state {
      text-align: center;
      padding: 60px;
      color: #a39eb9;
    }
    
    .loader {
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-top: 4px solid #8a2be2;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px auto;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .empty-state {
      text-align: center;
      padding: 50px;
      max-width: 500px;
      margin: 0 auto;
    }
    
    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 15px;
    }
    
    .empty-state h3 {
      font-family: 'Outfit', sans-serif;
      margin-bottom: 10px;
    }
    
    .empty-state p {
      color: #a39eb9;
      font-size: 0.95rem;
    }
    
    .item-card {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: transform 0.3s ease;
    }
    
    .item-card:hover {
      transform: translateY(-5px);
    }
    
    .item-visual {
      height: 160px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .item-emoji {
      font-size: 3.5rem;
      filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
      animation: float 4s ease-in-out infinite;
    }
    
    .item-category-tag {
      position: absolute;
      bottom: 12px;
      left: 12px;
      background: rgba(10, 8, 19, 0.7);
      backdrop-filter: blur(8px);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .item-content {
      padding: 20px;
      flex: 1;
    }
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
      gap: 10px;
    }
    
    .item-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 1.15rem;
      color: #fff;
    }
    
    .item-price {
      color: #00f2fe;
      font-weight: 700;
      font-size: 1.15rem;
    }
    
    .item-desc {
      color: #a39eb9;
      font-size: 0.9rem;
      line-height: 1.4;
    }
    
    .item-actions {
      padding: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      gap: 10px;
    }
    
    .w-full-btn {
      flex: 1;
      padding: 10px 14px;
      font-size: 0.85rem;
    }
    
    .toast {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: rgba(16, 185, 129, 0.95);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      padding: 12px 24px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      z-index: 2000;
    }
    
    .toast-icon {
      font-weight: 800;
    }
    
    .toast-text {
      font-weight: 500;
    }
  `]
})
export class CategoryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly itemService = inject(ItemService);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);

  readonly categoryName = signal<string>('');
  readonly items = signal<Item[]>([]);
  readonly loading = signal(true);
  readonly toastMessage = signal<string | null>(null);

  searchQuery = '';
  addingMap: { [key: number]: boolean } = {};

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const category = params.get('name') || 'Food';
      this.categoryName.set(category);
      this.fetchItems();
    });
  }

  fetchItems(): void {
    this.loading.set(true);
    this.itemService.getItems(this.categoryName()).subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSearchChange(): void {
    // Perform database search reactively as they type
    this.itemService.searchItems(this.searchQuery, this.categoryName()).subscribe({
      next: (data) => this.items.set(data)
    });
  }

  triggerSearch(): void {
    this.onSearchChange();
  }

  addToCart(item: Item): void {
    this.addingMap[item.id] = true;
    this.cartService.addToCart(item.id, 1).subscribe({
      next: () => {
        this.addingMap[item.id] = false;
        this.showToast(`Added ${item.name} to Cart`);
      },
      error: () => {
        this.addingMap[item.id] = false;
      }
    });
  }

  bookOrder(item: Item): void {
    // Store in OrderService for direct booking
    this.orderService.directBooking.set({
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1
    });
    // Navigate to payment
    this.router.navigate(['/payment']);
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 2500);
  }

  getVisualGradient(category: string): string {
    switch (category.toLowerCase()) {
      case 'food':
        return 'linear-gradient(135deg, rgba(255, 94, 98, 0.2), rgba(255, 153, 0, 0.2))';
      case 'snacks':
        return 'linear-gradient(135deg, rgba(245, 56, 3, 0.2), rgba(245, 208, 32, 0.2))';
      case 'cool drinks':
        return 'linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 242, 254, 0.2))';
      case 'combo offers':
        return 'linear-gradient(135deg, rgba(233, 53, 193, 0.2), rgba(185, 39, 252, 0.2))';
      default:
        return 'linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(0, 242, 254, 0.2))';
    }
  }

  getEmoji(category: string): string {
    switch (category.toLowerCase()) {
      case 'food': return '🍽️';
      case 'snacks': return '🍿';
      case 'cool drinks': return '🥤';
      case 'combo offers': return '🎁';
      default: return '🍔';
    }
  }
}

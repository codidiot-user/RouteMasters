import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="cart-header animate-fade-in">
        <h1 class="cart-heading">Your Shopping <span class="highlight">Cart</span></h1>
        <p class="cart-sub">Review items you've added before proceeding to checkout</p>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="loader"></div>
        <p>Updating cart details...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state glass-card animate-fade-in" *ngIf="!loading && cartService.cartItems().length === 0">
        <span class="empty-icon">🛒</span>
        <h3>Your Cart is Empty</h3>
        <p>Add delicious meals, snacks, or drinks from our catalog to get started!</p>
        <a routerLink="/home" class="btn btn-primary" style="margin-top: 20px;">Browse Categories</a>
      </div>

      <!-- Cart Content -->
      <div class="cart-layout" *ngIf="!loading && cartService.cartItems().length > 0">
        <div class="cart-items-list">
          <div 
            *ngFor="let item of cartService.cartItems(); let i = index" 
            class="cart-item-row glass-card animate-slide-up"
            [style.animation-delay]="(i * 50) + 'ms'"
          >
            <div class="item-pic" [style.background]="getVisualGradient(item.category)">
              <span>{{ getEmoji(item.category) }}</span>
            </div>
            
            <div class="item-info">
              <span class="item-cat-label">{{ item.category }}</span>
              <h3 class="item-name">{{ item.itemName }}</h3>
              <span class="item-unit-price">\${{ item.price.toFixed(2) }} each</span>
            </div>

            <div class="item-quantity">
              <span class="qty-label">Qty</span>
              <span class="qty-val">{{ item.quantity }}</span>
            </div>

            <div class="item-subtotal">
              <span class="sub-label">Total</span>
              <span class="sub-val">\${{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>

            <button class="btn-remove" (click)="removeItem(item.id)" title="Remove item">
              🗑️
            </button>
          </div>
        </div>

        <!-- Summary Panel -->
        <div class="cart-summary glass-card animate-slide-up" style="animation-delay: 200ms;">
          <h2 class="summary-title font-display">Order Summary</h2>
          
          <div class="summary-row">
            <span>Subtotal</span>
            <span>\${{ getSubtotal().toFixed(2) }}</span>
          </div>
          
          <div class="summary-row">
            <span>Shipping / Handling</span>
            <span class="text-success">FREE</span>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-row total-row">
            <span>Total</span>
            <span class="total-val">\${{ getSubtotal().toFixed(2) }}</span>
          </div>

          <button class="btn btn-primary w-full" (click)="checkout()" style="width: 100%; margin-top: 20px;">
            💳 Proceed to Checkout
          </button>
          
          <button class="btn btn-outline w-full" (click)="clearCart()" style="width: 100%; margin-top: 10px;">
            Clear Cart
          </button>
          
          <a routerLink="/home" class="continue-link">← Continue Shopping</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-heading {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 2.5rem;
      color: #fff;
      margin-bottom: 6px;
    }
    
    .cart-heading .highlight {
      background: linear-gradient(135deg, #8a2be2, #00f2fe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .cart-sub {
      color: #a39eb9;
      font-size: 1rem;
      margin-bottom: 30px;
    }
    
    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 30px;
      align-items: start;
    }
    
    @media (max-width: 992px) {
      .cart-layout {
        grid-template-columns: 1fr;
      }
    }
    
    .cart-items-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .cart-item-row {
      display: flex;
      align-items: center;
      padding: 15px 20px;
      gap: 20px;
    }
    
    @media (max-width: 576px) {
      .cart-item-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }
    
    .item-pic {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    
    .item-info {
      flex: 1;
    }
    
    .item-cat-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 700;
      color: #8a2be2;
      letter-spacing: 0.05em;
      display: block;
      margin-bottom: 3px;
    }
    
    .item-name {
      color: #fff;
      font-size: 1.05rem;
      font-weight: 600;
    }
    
    .item-unit-price {
      font-size: 0.85rem;
      color: #a39eb9;
    }
    
    .item-quantity, .item-subtotal {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .qty-label, .sub-label {
      font-size: 0.75rem;
      color: #a39eb9;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    
    .qty-val, .sub-val {
      font-weight: 600;
      color: #fff;
    }
    
    .sub-val {
      color: #00f2fe;
    }
    
    .btn-remove {
      background: transparent;
      border: none;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      transition: background 0.2s;
    }
    
    .btn-remove:hover {
      background: rgba(239, 68, 68, 0.15);
    }
    
    .cart-summary {
      padding: 25px;
    }
    
    .summary-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 20px;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 0.95rem;
      color: #a39eb9;
    }
    
    .summary-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
      margin: 15px 0;
    }
    
    .total-row {
      color: #fff;
      font-weight: 700;
    }
    
    .total-val {
      color: #00f2fe;
      font-size: 1.25rem;
    }
    
    .text-success {
      color: #10b981;
    }
    
    .continue-link {
      display: block;
      text-align: center;
      margin-top: 15px;
      color: #a39eb9;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }
    
    .continue-link:hover {
      color: #fff;
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
  `]
})
export class CartComponent implements OnInit {
  protected readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  loading = true;

  ngOnInit(): void {
    this.cartService.loadCart().subscribe({
      next: () => this.loading = false,
      error: () => this.loading = false
    });
  }

  removeItem(id: number): void {
    this.loading = true;
    this.cartService.removeFromCart(id).subscribe({
      next: () => this.loading = false,
      error: () => this.loading = false
    });
  }

  clearCart(): void {
    this.loading = true;
    this.cartService.clearCart().subscribe({
      next: () => this.loading = false,
      error: () => this.loading = false
    });
  }

  getSubtotal(): number {
    return this.cartService.cartItems().reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  checkout(): void {
    // directBooking = null means we are placing order from Cart contents!
    this.orderService.directBooking.set(null);
    this.router.navigate(['/payment']);
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

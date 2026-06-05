import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container auth-container">
      <div class="glass-card payment-card animate-fade-in">
        
        <!-- Step 1: Payment Selection -->
        <div *ngIf="!isConfirmed()">
          <h1 class="brand-title">Complete Order</h1>
          <p class="brand-subtitle">Choose your payment option to complete booking</p>

          <div class="order-summary-box">
            <h3 class="box-title font-display">Items in Order</h3>
            <div class="items-list">
              <!-- Direct Booking Item -->
              <div *ngIf="directItem(); else cartItemsTpl" class="summary-item">
                <span>{{ directItem()?.name }} (x{{ directItem()?.quantity }})</span>
                <span>\${{ ((directItem()?.price || 0) * (directItem()?.quantity || 1)).toFixed(2) }}</span>
              </div>
              <!-- Cart Items -->
              <ng-template #cartItemsTpl>
                <div *ngFor="let item of cartService.cartItems()" class="summary-item">
                  <span>{{ item.itemName }} (x{{ item.quantity }})</span>
                  <span>\${{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
              </ng-template>
            </div>
            
            <div class="summary-total">
              <span>Total Amount</span>
              <span class="total-val">\${{ totalAmount().toFixed(2) }}</span>
            </div>
          </div>

          <h3 class="section-title">Select Payment Method</h3>
          <div class="payment-options">
            <div 
              class="payment-option-card" 
              [class.selected]="selectedMethod() === 'Cash'"
              (click)="selectMethod('Cash')"
            >
              <div class="option-icon">💵</div>
              <div class="option-details">
                <span class="option-title">Cash on Delivery</span>
                <span class="option-desc">Pay cash when your order arrives</span>
              </div>
            </div>

            <div 
              class="payment-option-card" 
              [class.selected]="selectedMethod() === 'Online'"
              (click)="selectMethod('Online')"
            >
              <div class="option-icon">💳</div>
              <div class="option-details">
                <span class="option-title">Online Payment</span>
                <span class="option-desc">Pay instantly using Credit Card or UPI</span>
              </div>
            </div>
          </div>

          <div class="alert-box alert-error" *ngIf="errorMsg()">
            {{ errorMsg() }}
          </div>

          <button 
            class="btn btn-primary w-full" 
            [disabled]="loading() || !selectedMethod()"
            (click)="confirmOrder()"
            style="width: 100%; margin-top: 30px;"
          >
            {{ loading() ? 'Processing Order...' : 'Confirm Order & Send Email' }}
          </button>
          
          <a [routerLink]="directItem() ? '/home' : '/cart'" class="btn-cancel-payment">
            Cancel and Go Back
          </a>
        </div>

        <!-- Step 2: Confirmed Screen -->
        <div *ngIf="isConfirmed()" class="confirmed-content animate-fade-in">
          <div class="success-icon-badge">✓</div>
          <h2 class="confirmed-title font-display">Order Confirmed!</h2>
          <p class="confirmed-desc">
            Your order has been placed successfully. A detailed confirmation invoice has been sent to your registered email:
          </p>
          <div class="email-badge">{{ authService.currentUser()?.email }}</div>
          
          <p class="simulated-note">
            💡 [Simulation Mode]: Email logs added to project root file <span class="log-file-name">sent_emails.log</span>
          </p>

          <div class="divider"></div>

          <div class="confirmed-actions">
            <button class="btn btn-primary" routerLink="/orders">
              📦 See Orders
            </button>
            <button class="btn btn-secondary" routerLink="/cart">
              🛒 View Cart
            </button>
            <button class="btn btn-outline" (click)="logout()">
              Sign Out
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .payment-card {
      width: 100%;
      max-width: 550px;
    }
    
    .order-summary-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
    }
    
    .box-title {
      font-size: 1rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 12px;
    }
    
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      color: #a39eb9;
      font-size: 0.9rem;
    }
    
    .summary-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 15px;
      font-weight: 700;
      color: #fff;
    }
    
    .total-val {
      color: #00f2fe;
      font-size: 1.2rem;
    }
    
    .section-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 15px;
    }
    
    .payment-options {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .payment-option-card {
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 15px 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.02);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    
    .payment-option-card:hover {
      border-color: rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.04);
      transform: translateY(-2px);
    }
    
    .payment-option-card.selected {
      border-color: #8a2be2;
      background: rgba(138, 43, 226, 0.08);
      box-shadow: 0 0 15px rgba(138, 43, 226, 0.3);
    }
    
    .option-icon {
      font-size: 1.8rem;
    }
    
    .option-details {
      display: flex;
      flex-direction: column;
    }
    
    .option-title {
      font-weight: 600;
      color: #fff;
    }
    
    .option-desc {
      font-size: 0.8rem;
      color: #a39eb9;
      margin-top: 2px;
    }
    
    .btn-cancel-payment {
      display: block;
      text-align: center;
      margin-top: 15px;
      color: #a39eb9;
      font-size: 0.9rem;
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .btn-cancel-payment:hover {
      color: #ef4444;
    }
    
    /* Confirmed State styles */
    .confirmed-content {
      text-align: center;
      padding: 20px 10px;
    }
    
    .success-icon-badge {
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 50%;
      color: #fff;
      font-size: 2.2rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px auto;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
      animation: bounce 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite alternate;
    }
    
    @keyframes bounce {
      0% { transform: translateY(0); }
      100% { transform: translateY(-8px); }
    }
    
    .confirmed-title {
      font-size: 1.8rem;
      color: #fff;
      font-weight: 800;
      margin-bottom: 12px;
    }
    
    .confirmed-desc {
      color: #a39eb9;
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    
    .email-badge {
      display: inline-block;
      background: rgba(0, 242, 254, 0.1);
      border: 1px solid rgba(0, 242, 254, 0.3);
      color: #00f2fe;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: 25px;
      box-shadow: 0 0 10px rgba(0, 242, 254, 0.1);
    }
    
    .simulated-note {
      font-size: 0.8rem;
      color: #a39eb9;
      background: rgba(255, 255, 255, 0.03);
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 25px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .log-file-name {
      color: #f59e0b;
      font-family: monospace;
    }
    
    .divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
      margin: 20px 0;
    }
    
    .confirmed-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    
    .confirmed-actions button, .confirmed-actions a {
      font-size: 0.85rem;
      padding: 10px 14px;
    }
    
    .confirmed-actions .btn-outline {
      grid-column: span 2;
      margin-top: 5px;
    }
    
    .alert-box {
      padding: 12px;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-top: 20px;
      animation: fadeIn 0.3s ease;
    }
    
    .alert-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
  `]
})
export class PaymentComponent implements OnInit {
  protected readonly cartService = inject(CartService);
  protected readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  readonly directItem = computed(() => this.orderService.directBooking());
  readonly selectedMethod = signal<string | null>(null);
  readonly isConfirmed = signal(false);
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly totalAmount = computed(() => {
    const direct = this.directItem();
    if (direct) {
      return direct.price * direct.quantity;
    }
    return this.cartService.cartItems().reduce((acc, item) => acc + (item.price * item.quantity), 0);
  });

  ngOnInit(): void {
    // If not direct booking, make sure cart is populated
    if (!this.directItem()) {
      this.cartService.loadCart().subscribe();
    }
  }

  selectMethod(method: string): void {
    this.selectedMethod.set(method);
  }

  confirmOrder(): void {
    const method = this.selectedMethod();
    if (!method) return;

    this.loading.set(true);
    this.errorMsg.set(null);

    const isFromCart = !this.directItem();
    const directBooking = this.directItem();
    
    const directPayload = directBooking ? {
      itemId: directBooking.itemId,
      quantity: directBooking.quantity
    } : undefined;

    this.orderService.placeOrder(method, isFromCart, directPayload).subscribe({
      next: () => {
        this.isConfirmed.set(true);
        this.loading.set(false);
        // Clear direct booking and reload cart count (it will be empty on backend)
        this.orderService.directBooking.set(null);
        this.cartService.loadCart().subscribe();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Failed to place order. Please try again.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

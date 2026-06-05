import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order, OrderService } from '../services/order.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="orders-header animate-fade-in">
        <h1 class="orders-heading">Your Order <span class="highlight">History</span></h1>
        <p class="orders-sub">Track order status, manage cancellations, or place new orders</p>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading()">
        <div class="loader"></div>
        <p>Fetching your orders...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state glass-card animate-fade-in" *ngIf="!loading() && orders().length === 0">
        <span class="empty-icon">📦</span>
        <h3>No Orders Found</h3>
        <p>You haven't placed any orders yet. Explore our delicious categories to make your first purchase!</p>
        <a routerLink="/home" class="btn btn-primary" style="margin-top: 20px;">Browse Categories</a>
      </div>

      <!-- Orders List -->
      <div class="orders-list-container" *ngIf="!loading() && orders().length > 0">
        <div 
          *ngFor="let order of orders(); let i = index" 
          class="order-card glass-card animate-slide-up"
          [style.animation-delay]="(i * 60) + 'ms'"
        >
          <!-- Order Metadata -->
          <div class="order-meta-header">
            <div class="meta-item">
              <span class="meta-lbl">Order Placed</span>
              <span class="meta-val">{{ formatDate(order.orderDate) }}</span>
            </div>
            
            <div class="meta-item">
              <span class="meta-lbl">Total Price</span>
              <span class="meta-val price-val">\${{ order.totalAmount.toFixed(2) }}</span>
            </div>

            <div class="meta-item">
              <span class="meta-lbl">Payment Method</span>
              <span class="meta-val">{{ order.paymentMethod }}</span>
            </div>

            <div class="meta-item order-id-meta">
              <span class="meta-lbl">Order ID</span>
              <span class="meta-val font-mono">#{{ order.id }}</span>
            </div>

            <div class="meta-status-container">
              <span class="status-badge" [class]="getStatusClass(order.status)">
                {{ order.status }}
              </span>
            </div>
          </div>

          <!-- Items in Order -->
          <div class="order-items-list">
            <div *ngFor="let item of order.items" class="order-item-row">
              <span class="item-icon-small">{{ getEmoji(item.category) }}</span>
              <div class="item-row-info">
                <span class="item-name-small">{{ item.itemName }}</span>
                <span class="item-cat-small">{{ item.category }}</span>
              </div>
              <span class="item-qty-small">x{{ item.quantity }}</span>
              <span class="item-sub-small">\${{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="order-actions-bar" *ngIf="canCancel(order.status)">
            <button 
              class="btn btn-danger btn-cancel-order" 
              [disabled]="cancellingMap[order.id]"
              (click)="cancelOrder(order.id)"
            >
              {{ cancellingMap[order.id] ? 'Cancelling...' : 'Cancel Order' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-heading {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 2.5rem;
      color: #fff;
      margin-bottom: 6px;
    }
    
    .orders-heading .highlight {
      background: linear-gradient(135deg, #8a2be2, #00f2fe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .orders-sub {
      color: #a39eb9;
      font-size: 1rem;
      margin-bottom: 35px;
    }
    
    .orders-list-container {
      display: flex;
      flex-direction: column;
      gap: 25px;
      max-width: 900px;
      margin: 0 auto;
    }
    
    .order-card {
      padding: 0;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .order-meta-header {
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding: 20px 25px;
      display: grid;
      grid-template-columns: repeat(4, 1fr) auto;
      gap: 20px;
      align-items: center;
    }
    
    @media (max-width: 768px) {
      .order-meta-header {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }
      .order-id-meta {
        grid-column: span 2;
      }
    }
    
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    
    .meta-lbl {
      font-size: 0.75rem;
      color: #a39eb9;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    
    .meta-val {
      font-weight: 600;
      color: #fff;
      font-size: 0.95rem;
    }
    
    .font-mono {
      font-family: monospace;
      color: #00f2fe;
    }
    
    .price-val {
      color: #00f2fe;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .status-pending {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #f59e0b;
    }
    
    .status-completed {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10b981;
    }
    
    .status-cancelled {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
    
    .order-items-list {
      padding: 20px 25px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .order-item-row {
      display: flex;
      align-items: center;
      gap: 15px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    }
    
    .order-item-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    
    .item-icon-small {
      font-size: 1.3rem;
    }
    
    .item-row-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .item-name-small {
      color: #fff;
      font-weight: 600;
      font-size: 0.95rem;
    }
    
    .item-cat-small {
      font-size: 0.75rem;
      color: #a39eb9;
    }
    
    .item-qty-small {
      color: #a39eb9;
      font-weight: 500;
      font-size: 0.9rem;
    }
    
    .item-sub-small {
      color: #fff;
      font-weight: 600;
      font-size: 0.95rem;
    }
    
    .order-actions-bar {
      background: rgba(255, 255, 255, 0.01);
      border-top: 1px solid rgba(255, 255, 255, 0.04);
      padding: 12px 25px;
      display: flex;
      justify-content: flex-end;
    }
    
    .btn-cancel-order {
      padding: 8px 16px;
      font-size: 0.8rem;
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
export class OrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);
  cancellingMap: { [key: number]: boolean } = {};

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.loading.set(true);
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  canCancel(status: string): boolean {
    return status.toLowerCase() === 'pending';
  }

  cancelOrder(id: number): void {
    this.cancellingMap[id] = true;
    this.orderService.cancelOrder(id).subscribe({
      next: () => {
        this.cancellingMap[id] = false;
        // Refresh orders list
        this.fetchOrders();
      },
      error: () => {
        this.cancellingMap[id] = false;
      }
    });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
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

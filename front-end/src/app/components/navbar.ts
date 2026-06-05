import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" *ngIf="authService.isLoggedIn()">
      <div class="nav-container">
        <a routerLink="/home" class="nav-brand">
          <span class="brand-glow">Retail</span>Sphere
        </a>
        
        <div class="nav-links">
          <a routerLink="/home" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏠</span> Home
          </a>
          <a routerLink="/cart" routerLinkActive="active" class="nav-item cart-link">
            <span class="nav-icon">🛒</span> Cart
            <span class="cart-badge" *ngIf="cartCount() > 0">{{ cartCount() }}</span>
          </a>
          <a routerLink="/orders" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📦</span> My Orders
          </a>
        </div>
        
        <div class="nav-user">
          <span class="user-greeting">Hi, {{ authService.currentUser()?.username }}</span>
          <button (click)="logout()" class="btn-logout">Logout</button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: rgba(10, 8, 19, 0.7);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 15px 0;
    }
    
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .nav-brand {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.5rem;
      color: #fff;
      text-decoration: none;
      letter-spacing: -0.02em;
    }
    
    .brand-glow {
      background: linear-gradient(135deg, #8a2be2, #00f2fe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .nav-links {
      display: flex;
      align-items: center;
      gap: 25px;
    }
    
    .nav-item {
      color: #a39eb9;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 6px;
      transition: all 0.25s ease;
    }
    
    .nav-item:hover, .nav-item.active {
      color: #fff;
      background: rgba(255, 255, 255, 0.05);
    }
    
    .nav-item.active {
      border-bottom: 2px solid #8a2be2;
      border-radius: 6px 6px 0 0;
    }
    
    .cart-link {
      position: relative;
    }
    
    .cart-badge {
      background: #00f2fe;
      color: #07050f;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 10px;
      position: absolute;
      top: -5px;
      right: -10px;
      box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
    }
    
    .nav-user {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .user-greeting {
      font-size: 0.9rem;
      color: #a39eb9;
    }
    
    .btn-logout {
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #ef4444;
      padding: 6px 14px;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-logout:hover {
      background: #ef4444;
      color: #fff;
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
    }
  `]
})
export class NavbarComponent {
  protected readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  readonly cartCount = computed(() => {
    return this.cartService.cartItems().reduce((acc, item) => acc + item.quantity, 0);
  });

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

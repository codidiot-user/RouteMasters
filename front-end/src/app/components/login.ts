import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="glass-card auth-card animate-fade-in">
        <h1 class="brand-title">Welcome Back</h1>
        <p class="brand-subtitle">Login to access your retail ordering portal</p>
        
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              class="form-input" 
              placeholder="name@example.com"
              [(ngModel)]="model.email" 
              #email="ngModel"
              required
              email
            />
            <div class="error-msg" *ngIf="email.invalid && (email.dirty || email.touched)">
              Please enter a valid email address.
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              class="form-input" 
              placeholder="••••••••"
              [(ngModel)]="model.password" 
              #password="ngModel"
              required
            />
            <div class="error-msg" *ngIf="password.invalid && (password.dirty || password.touched)">
              Password is required.
            </div>
          </div>
          
          <div class="alert-box alert-error" *ngIf="errorMsg()">
            {{ errorMsg() }}
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary w-full" 
            [disabled]="loginForm.invalid || loading()"
            style="width: 100%; margin-top: 10px;"
          >
            {{ loading() ? 'Logging in...' : 'Login' }}
          </button>
          
          <div class="auth-redirect">
            Don't have an account? <a routerLink="/register">Register here</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .w-full {
      width: 100%;
    }
    .error-msg {
      color: #ef4444;
      font-size: 0.8rem;
      margin-top: 5px;
    }
    .alert-box {
      padding: 12px;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-bottom: 20px;
      animation: fadeIn 0.3s ease;
    }
    .alert-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
    .auth-redirect {
      text-align: center;
      margin-top: 20px;
      font-size: 0.9rem;
      color: #a39eb9;
    }
    .auth-redirect a {
      color: #00f2fe;
      text-decoration: none;
      font-weight: 600;
    }
    .auth-redirect a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  readonly model = { email: '', password: '' };
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);

  onSubmit(): void {
    if (!this.model.email || !this.model.password) return;

    this.loading.set(true);
    this.errorMsg.set(null);

    this.authService.login(this.model.email, this.model.password).subscribe({
      next: () => {
        // Pre-load the cart immediately to populate items count
        this.cartService.loadCart().subscribe();
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Invalid email or password.');
      }
    });
  }
}

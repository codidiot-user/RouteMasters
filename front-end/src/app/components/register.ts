import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="glass-card auth-card animate-fade-in">
        <h1 class="brand-title">Create Account</h1>
        <p class="brand-subtitle">Join us to start ordering premium items</p>
        
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              class="form-input" 
              placeholder="e.g. John Doe"
              [(ngModel)]="model.username" 
              #username="ngModel"
              required
              minlength="3"
            />
            <div class="error-msg" *ngIf="username.invalid && (username.dirty || username.touched)">
              Username is required (min 3 chars).
            </div>
          </div>
          
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
              placeholder="Min 6 characters"
              [(ngModel)]="model.password" 
              #password="ngModel"
              required
              minlength="6"
            />
            <div class="error-msg" *ngIf="password.invalid && (password.dirty || password.touched)">
              Password must be at least 6 characters.
            </div>
          </div>
          
          <div class="alert-box alert-error" *ngIf="errorMsg()">
            {{ errorMsg() }}
          </div>
          
          <div class="alert-box alert-success" *ngIf="successMsg()">
            {{ successMsg() }}
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary w-full" 
            [disabled]="registerForm.invalid || loading()"
            style="width: 100%; margin-top: 10px;"
          >
            {{ loading() ? 'Registering...' : 'Register' }}
          </button>
          
          <div class="auth-redirect">
            Already have an account? <a routerLink="/login">Login here</a>
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
    .alert-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
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
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly model = { username: '', email: '', password: '' };
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly successMsg = signal<string | null>(null);

  onSubmit(): void {
    if (!this.model.username || !this.model.email || !this.model.password) return;

    this.loading.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    this.authService.register(this.model.username, this.model.email, this.model.password).subscribe({
      next: () => {
        this.successMsg.set('Registration successful! Redirecting to login...');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'An error occurred during registration. Please try again.');
      }
    });
  }
}

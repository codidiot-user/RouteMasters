import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

interface CategoryCard {
  name: string;
  routeParam: string;
  icon: string;
  description: string;
  gradient: string;
  badge?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="home-hero animate-fade-in">
        <h1 class="hero-title">Experience Premium <span class="highlight">Ordering</span></h1>
        <p class="hero-subtitle">Select a category below to browse our fresh and hand-seeded database catalogue</p>
      </div>

      <div class="categories-grid">
        <div 
          *ngFor="let card of categories; let i = index" 
          class="category-card glass-card animate-slide-up"
          [style.animation-delay]="(i * 100) + 'ms'"
          (click)="navigateToCategory(card.routeParam)"
        >
          <div class="card-glow" [style.background]="card.gradient"></div>
          
          <div class="category-header">
            <span class="category-icon" [style.background]="card.gradient">{{ card.icon }}</span>
            <span class="category-badge" *ngIf="card.badge">{{ card.badge }}</span>
          </div>

          <div class="category-info">
            <h2 class="category-title">{{ card.name }}</h2>
            <p class="category-desc">{{ card.description }}</p>
          </div>
          
          <div class="category-action">
            <span class="action-text">Explore Category</span>
            <span class="action-arrow">→</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-hero {
      text-align: center;
      margin-bottom: 50px;
      margin-top: 20px;
    }
    
    .hero-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 3rem;
      color: #fff;
      margin-bottom: 12px;
      letter-spacing: -0.03em;
    }
    
    .hero-title .highlight {
      background: linear-gradient(135deg, #8a2be2, #00f2fe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .hero-subtitle {
      color: #a39eb9;
      font-size: 1.15rem;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.5;
    }
    
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 30px;
      max-width: 960px;
      margin: 0 auto;
    }
    
    @media (max-width: 768px) {
      .categories-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      .hero-title {
        font-size: 2.2rem;
      }
    }
    
    .category-card {
      position: relative;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      height: 240px;
      justify-content: space-between;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.06);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .category-card:hover {
      transform: translateY(-8px) scale(1.02);
      border-color: rgba(255, 255, 255, 0.15);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    
    .card-glow {
      position: absolute;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      filter: blur(80px);
      top: -30px;
      right: -30px;
      opacity: 0.15;
      pointer-events: none;
      transition: all 0.4s ease;
    }
    
    .category-card:hover .card-glow {
      opacity: 0.3;
      transform: scale(1.2);
    }
    
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .category-icon {
      font-size: 1.8rem;
      width: 60px;
      height: 60px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    }
    
    .category-badge {
      background: rgba(0, 242, 254, 0.15);
      color: #00f2fe;
      border: 1px solid rgba(0, 242, 254, 0.3);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    
    .category-info {
      margin-top: 15px;
    }
    
    .category-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 1.6rem;
      color: #fff;
      margin-bottom: 6px;
    }
    
    .category-desc {
      color: #a39eb9;
      font-size: 0.95rem;
      line-height: 1.4;
    }
    
    .category-action {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 15px;
      font-size: 0.9rem;
      font-weight: 600;
      color: #8a2be2;
      transition: all 0.3s ease;
    }
    
    .category-card:hover .category-action {
      color: #00f2fe;
    }
    
    .action-arrow {
      transition: transform 0.3s ease;
    }
    
    .category-card:hover .action-arrow {
      transform: translateX(5px);
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-slide-up {
      opacity: 0;
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class HomeComponent {
  private readonly router = inject(Router);

  readonly categories: CategoryCard[] = [
    {
      name: 'Food',
      routeParam: 'Food',
      icon: '🍽️',
      description: 'Hot meals, burgers, artisanal pizzas, delicious Biryani, and healthy noodles cooked fresh.',
      gradient: 'linear-gradient(135deg, #ff9900, #ff5e62)',
      badge: 'Fresh Cooked'
    },
    {
      name: 'Snacks',
      routeParam: 'Snacks',
      icon: '🍿',
      description: 'Kettle chips, French fries, samosas, loaded nachos, popcorn, and crunchy bites for all occasions.',
      gradient: 'linear-gradient(135deg, #f5d020, #f53803)',
      badge: 'Crunchy'
    },
    {
      name: 'Cool Drinks',
      routeParam: 'Cool Drinks',
      icon: '🥤',
      description: 'Chilled soft drinks, iced tea, fresh orange juice, and revitalizing mocktails.',
      gradient: 'linear-gradient(135deg, #00f2fe, #4facfe)',
      badge: 'Ice Cold'
    },
    {
      name: 'Combo Offers',
      routeParam: 'Combo Offers',
      icon: '🎁',
      description: 'Save big with combined burger, pizza, or snack packs crafted for groups and movie nights.',
      gradient: 'linear-gradient(135deg, #b927fc, #e935c1)',
      badge: 'Save 20%+'
    }
  ];

  navigateToCategory(param: string): void {
    this.router.navigate(['/category', param]);
  }
}

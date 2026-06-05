import { Routes } from '@angular/router';
import { LoginComponent } from './components/login';
import { RegisterComponent } from './components/register';
import { HomeComponent } from './components/home';
import { CategoryComponent } from './components/category';
import { PaymentComponent } from './components/payment';
import { CartComponent } from './components/cart';
import { OrdersComponent } from './components/orders';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'home', 
    component: HomeComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'category/:name', 
    component: CategoryComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'payment', 
    component: PaymentComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'cart', 
    component: CartComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'orders', 
    component: OrdersComponent, 
    canActivate: [authGuard] 
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];

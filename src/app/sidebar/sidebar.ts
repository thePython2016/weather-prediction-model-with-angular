import { Component, ViewEncapsulation, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export interface NavItem {
  label: string;
  icon: string;
  className?: string;
  route?: string | null;
  children?: { label: string; route: string; icon?: string; className?: string }[];
  open?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  // encapsulation: ViewEncapsulation.None
})
export class Sidebar implements OnInit {
  sidebarCollapsed = false;
  isProfileOpen    = false;
  user = { name: '', email: '', initials: '' };

  navItems: NavItem[] = [
    { label: 'Dashboard',          icon: 'dashboard',      route: '/',                   className: 'dash-item-block' },
    { label: 'Weather Input',      icon: 'cloud_upload',   open: false, children: [
        { label: 'Add',    route: '/add-weather-input',    icon: 'add_circle_outline',   className: 'add-weather-input' },
        { label: 'Update', route: '/update-weather-input', icon: 'edit',                 className: 'update-weather-input' },
        { label: 'View',   route: '/view-weather-input',   icon: 'visibility',           className: 'view-weather-input' },
      ]
    },
    { label: 'Weather Prediction', icon: 'model_training', route: '/prediction' },
    { label: 'Weather by Region',  icon: 'map',            route: '/weather-by-region' },
    { label: 'Weather by Day',     icon: 'today',          route: '/weather-by-day' },
    { label: 'Charts',             icon: 'bar_chart',      route: '/charts' },
    { label: 'Reports',            icon: 'summarize',      route: null },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const userData = this.auth.getUser();
    if (userData) {
      this.user.name     = userData.name;
      this.user.email    = userData.email;
      this.user.initials = userData.name
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
  }

  isChildActive(item: NavItem): boolean {
    if (!item.children) return false;
    return item.children.some(child => this.router.isActive(child.route, false));
  }

  toggleDropdown(item: NavItem, event: Event): void {
    event.stopPropagation();
    item.open = !item.open;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isProfileOpen = !this.isProfileOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const popup  = document.getElementById('profilePopup');
    const button = document.getElementById('profileBtn');
    if (!popup || !button) return;
    if (!popup.contains(event.target as Node) && !button.contains(event.target as Node)) {
      this.isProfileOpen = false;
    }
  }

  /**
   * Delegates the actual logout work (stopping intervals, clearing
   * sessionStorage, optional backend call, redirect) to AuthService
   * so this component doesn't duplicate that logic.
   */
  logout(): void {
    this.auth.logout();
  }
}
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../sidebar/sidebar';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Sidebar],
  templateUrl: './layout.html',
  styleUrl: './layout.css'

})
export class Layout implements OnInit, OnDestroy {
  userName  = '';
  userEmail = '';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
     const user = this.auth.getUser();
     this.userName  = user?.name  || '';
     this.userEmail = user?.email || '';
  }

  ngOnDestroy(): void {
    this.auth.stopTokenInterval();
  }

  @HostListener('window:pageshow', ['$event'])
  async onPageShow(event: PageTransitionEvent): Promise<void> {
    if (event.persisted) {
      const valid = await this.auth.verifyToken();
      if (!valid) this.auth.handleUnauthorized();
    }
  }
}
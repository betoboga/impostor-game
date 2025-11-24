import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="app-container">
      <div class="card" style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px;">
        <div style="font-size: 4rem; margin-bottom: 20px;">🕵️</div>
        <h1>IMPOSTOR</h1>
        <p>Descubre quién miente entre tus amigos.</p>
        
        <div style="flex-grow: 1;"></div>
        
        <button class="btn" (click)="start()">NUEVA PARTIDA</button>
      </div>
    </div>
  `,
    styles: []
})
export class HomeComponent {
    constructor(private router: Router) { }

    start() {
        this.router.navigate(['/lobby']);
    }
}

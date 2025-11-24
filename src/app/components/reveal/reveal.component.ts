import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';

@Component({
    selector: 'app-reveal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="app-container">
      <div class="card" style="text-align: center; min-height: 400px; display: flex; flex-direction: column; justify-content: center;">
        
        <ng-container *ngIf="!isRevealing()">
          <h2>Pasa el dispositivo a:</h2>
          <div style="font-size: 2.5rem; font-weight: 800; margin: 30px 0; color: var(--secondary-color);">
            {{ currentPlayer()?.name }}
          </div>
          <p>Asegúrate de que nadie más esté mirando.</p>
          <div style="flex-grow: 1;"></div>
          <button class="btn" (click)="showRole()">SOY {{ currentPlayer()?.name | uppercase }}</button>
        </ng-container>

        <ng-container *ngIf="isRevealing()">
          <h2>Tu palabra secreta es:</h2>
          
          <div class="role-reveal" [ngClass]="{'role-impostor': currentPlayer()?.role === 'impostor', 'role-citizen': currentPlayer()?.role === 'citizen'}">
            {{ currentPlayer()?.word }}
          </div>

          <p *ngIf="currentPlayer()?.role === 'impostor'">
            Intenta pasar desapercibido y adivinar la palabra.
          </p>
          <p *ngIf="currentPlayer()?.role === 'citizen'">
            Encuentra al impostor.
          </p>

          <div style="flex-grow: 1;"></div>
          <button class="btn" (click)="next()">ENTENDIDO</button>
        </ng-container>

      </div>
    </div>
  `
})
export class RevealComponent {
    gameService = inject(GameService);
    router = inject(Router);

    isRevealing = signal(false);
    currentPlayer = this.gameService.currentPlayerToReveal;

    showRole() {
        this.isRevealing.set(true);
    }

    next() {
        this.isRevealing.set(false);
        this.gameService.revealNext();
        if (this.gameService.gameState() === 'PLAYING') {
            this.router.navigate(['/game']);
        }
    }
}

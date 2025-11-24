import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';

@Component({
    selector: 'app-game',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="app-container">
      <div class="card" style="text-align: center;">
        <h2>Ronda {{ gameService.currentRound() }}</h2>
        
        <div style="margin: 40px 0;">
          <div style="font-size: 1.2rem; margin-bottom: 10px;">Jugadores:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
            <span *ngFor="let player of gameService.players()" class="badge" style="font-size: 1rem; padding: 8px 16px;">
              {{ player.name }}
            </span>
          </div>
        </div>

        <p *ngIf="gameService.gameState() === 'PLAYING'">Debatid y encontrad al impostor.</p>
        
        <div *ngIf="gameService.gameState() === 'PLAYING'">
           <button class="btn" style="background: linear-gradient(45deg, #ff4081, #ff80ab);" (click)="revealImpostor()">DESCUBRIR IMPOSTOR</button>
        </div>

        <div *ngIf="gameService.gameState() === 'FINISHED'">
          <h3>El Impostor era:</h3>
          <div class="role-reveal role-impostor" style="font-size: 2rem; margin: 20px 0;">
            {{ getImpostorName() }}
          </div>
          <p>La palabra era: <strong style="color: var(--secondary-color); font-size: 1.2rem;">{{ getWord() }}</strong></p>

          <button class="btn" (click)="nextRound()">SIGUIENTE RONDA</button>
          <button class="btn btn-secondary" (click)="exit()" style="margin-top: 10px;">SALIR</button>
        </div>

      </div>
    </div>
  `
})
export class GameComponent {
    gameService = inject(GameService);
    router = inject(Router);

    revealImpostor() {
        this.gameService.endRound();
    }

    getImpostorName() {
        return this.gameService.players().find(p => p.role === 'impostor')?.name;
    }

    getWord() {
        return this.gameService.players().find(p => p.role === 'citizen')?.word;
    }

    nextRound() {
        this.gameService.nextRound();
        this.router.navigate(['/reveal']);
    }

    exit() {
        this.gameService.resetGame();
        this.router.navigate(['/']);
    }
}

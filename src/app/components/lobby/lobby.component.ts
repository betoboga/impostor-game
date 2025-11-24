import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';

@Component({
    selector: 'app-lobby',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="app-container">
      <div class="card">
        <h2>Lobby</h2>
        
        <div class="input-group" style="margin-bottom: 20px;">
          <input type="text" [(ngModel)]="playerName" placeholder="Nombre del jugador" (keyup.enter)="addPlayer()">
          <button class="btn" (click)="addPlayer()" [disabled]="!playerName" style="margin-top: 10px;">Añadir</button>
        </div>

        <ul class="list-group">
          <li *ngFor="let player of gameService.players(); let i = index" class="list-item">
            <span style="font-weight: 600; font-size: 1.1rem;">{{ player.name }}</span>
            <button class="btn-secondary" style="width: auto; padding: 8px 12px; margin: 0; border-radius: 50%;" (click)="removePlayer(i)">✕</button>
          </li>
        </ul>

        <div *ngIf="gameService.players().length === 0" style="text-align: center; color: var(--text-secondary); margin: 20px 0;">
          Añade jugadores para empezar...
        </div>

        <p *ngIf="gameService.players().length > 0 && gameService.players().length < 3" style="color: var(--error-color); text-align: center;">
          Mínimo 3 jugadores.
        </p>

        <button class="btn" (click)="startGame()" [disabled]="gameService.players().length < 3">
          EMPEZAR PARTIDA
        </button>
      </div>
    </div>
  `
})
export class LobbyComponent {
    gameService = inject(GameService);
    router = inject(Router);
    playerName = '';

    addPlayer() {
        if (this.playerName.trim()) {
            this.gameService.addPlayer(this.playerName.trim());
            this.playerName = '';
        }
    }

    removePlayer(index: number) {
        this.gameService.removePlayer(index);
    }

    startGame() {
        this.gameService.startGame();
        this.router.navigate(['/reveal']);
    }
}

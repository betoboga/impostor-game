import { Component, inject, signal } from '@angular/core';
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
        <!-- VISTA 1: LISTA DE JUGADORES -->
        <ng-container *ngIf="!isConfigStage()">
          <div
            style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;"
          >
            <h2 style="margin: 0;">Lobby</h2>
            <span class="badge">{{ gameService.players().length }}/10</span>
          </div>

          <div class="input-group" style="margin-bottom: 20px;">
            <input
              type="text"
              [(ngModel)]="playerName"
              placeholder="Nombre del jugador"
              (keyup.enter)="addPlayer()"
              [disabled]="gameService.players().length >= 10"
            />
            <button
              class="btn"
              (click)="addPlayer()"
              [disabled]="!playerName || gameService.players().length >= 10"
              style="margin-top: 10px;"
            >
              {{ gameService.players().length >= 10 ? 'Lleno' : 'Añadir' }}
            </button>
          </div>

          <ul class="list-group" style="max-height: 300px; overflow-y: auto;">
            <li *ngFor="let player of gameService.players(); let i = index" class="list-item">
              <span style="font-weight: 600; font-size: 1.1rem;">{{ player.name }}</span>
              <button
                class="btn-secondary"
                style="width: auto; padding: 8px 12px; margin: 0; border-radius: 50%;"
                (click)="removePlayer(i)"
              >
                ✕
              </button>
            </li>
          </ul>

          <div
            *ngIf="gameService.players().length === 0"
            style="text-align: center; color: var(--text-secondary); margin: 20px 0;"
          >
            Añade jugadores para empezar...
          </div>

          <p
            *ngIf="gameService.players().length > 0 && gameService.players().length < 3"
            style="color: var(--error-color); text-align: center;"
          >
            Mínimo 3 jugadores.
          </p>

          <button
            class="btn"
            (click)="goToConfig()"
            [disabled]="gameService.players().length < 3"
          >
            CONTINUAR
          </button>
        </ng-container>

        <!-- VISTA 2: CONFIGURACIÓN -->
        <ng-container *ngIf="isConfigStage()">
          <h2 style="margin-bottom: 24px;">Configuración</h2>

          <div style="margin-bottom: 24px;">
            <label style="display: block; margin-bottom: 12px; font-weight: 600;">Número de Impostores:</label>
            <div style="display: flex; gap: 12px;">
              <button 
                class="btn" 
                [style.background-color]="gameService.impostorCount() === 1 ? 'var(--primary-color)' : 'var(--bg-secondary)'"
                [style.color]="gameService.impostorCount() === 1 ? 'white' : 'var(--text-primary)'"
                (click)="gameService.impostorCount.set(1)"
                style="flex: 1;"
              >
                1
              </button>
              <button 
                class="btn" 
                [style.background-color]="gameService.impostorCount() === 2 ? 'var(--primary-color)' : 'var(--bg-secondary)'"
                [style.color]="gameService.impostorCount() === 2 ? 'white' : 'var(--text-primary)'"
                [style.opacity]="gameService.players().length < 6 ? '0.5' : '1'"
                [disabled]="gameService.players().length < 6"
                (click)="gameService.impostorCount.set(2)"
                style="flex: 1;"
              >
                2
              </button>
            </div>
            <p *ngIf="gameService.players().length < 6" style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;">
              * Se requieren al menos 6 jugadores para 2 impostores.
            </p>
          </div>

          <div style="margin-bottom: 32px; display: flex; align-items: center; justify-content: space-between; background: var(--bg-secondary); padding: 16px; border-radius: 12px;">
            <div>
              <span style="display: block; font-weight: 600;">Pistas para impostores</span>
              <small style="color: var(--text-secondary);">Muestra letra inicial y longitud de la palabra.</small>
            </div>
            <label class="switch" style="position: relative; display: inline-block; width: 50px; height: 28px;">
              <input type="checkbox" [checked]="gameService.hintsEnabled()" (change)="gameService.hintsEnabled.set(!gameService.hintsEnabled())" style="opacity: 0; width: 0; height: 0;">
              <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px;" 
                    [style.background-color]="gameService.hintsEnabled() ? 'var(--primary-color)' : '#ccc'">
                <span style="position: absolute; content: ''; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;"
                      [style.transform]="gameService.hintsEnabled() ? 'translateX(22px)' : 'translateX(0)'"></span>
              </span>
            </label>
          </div>

          <div style="display: flex; gap: 12px;">
            <button class="btn-secondary" (click)="isConfigStage.set(false)" style="flex: 1;">VOLVER</button>
            <button class="btn" (click)="startGame()" [disabled]="gameService.isLoading()" style="flex: 2;">
              {{ gameService.isLoading() ? 'INICIANDO...' : '¡EMPEZAR!' }}
            </button>
          </div>
        </ng-container>
      </div>
    </div>
  `,
})
export class LobbyComponent {
  gameService = inject(GameService);
  router = inject(Router);
  playerName = '';
  isConfigStage = signal(false);

  addPlayer() {
    if (this.playerName.trim()) {
      this.gameService.addPlayer(this.playerName.trim());
      this.playerName = '';
    }
  }

  removePlayer(index: number) {
    this.gameService.removePlayer(index);
  }

  goToConfig() {
    if (this.gameService.players().length >= 3) {
      this.isConfigStage.set(true);
    }
  }

  async startGame() {
    await this.gameService.startGame();
    this.router.navigate(['/reveal']);
  }
}

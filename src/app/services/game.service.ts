import { Injectable, signal, computed } from '@angular/core';

export interface Player {
  name: string;
  role: 'citizen' | 'impostor';
  word: string;
}

export type GameState = 'LOBBY' | 'REVEAL' | 'PLAYING' | 'FINISHED';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  players = signal<Player[]>([]);
  gameState = signal<GameState>('LOBBY');
  currentRound = signal(0);
  
  // For reveal phase
  revealingPlayerIndex = signal(0);
  
  // Computed
  currentPlayerToReveal = computed(() => {
    const players = this.players();
    const index = this.revealingPlayerIndex();
    if (index < players.length) {
      return players[index];
    }
    return null;
  });

  private words = [
    { word: 'Mesa' },
    { word: 'Pizza' },
    { word: 'Perro' },
    { word: 'Playa' },
    { word: 'Avión' },
    { word: 'Fútbol' },
    { word: 'Guitarra' },
    { word: 'Helado' },
    { word: 'Montaña' },
    { word: 'Libro' },
    { word: 'Coche' },
    { word: 'Ordenador' },
    { word: 'Teléfono' },
    { word: 'Reloj' },
    { word: 'Zapato' },
    { word: 'Gafas' },
    { word: 'Sol' },
    { word: 'Luna' },
    { word: 'Estrella' },
    { word: 'Flor' }
  ];

  addPlayer(name: string) {
    if (this.players().length < 4) {
      this.players.update(p => [...p, { name, role: 'citizen', word: '' }]);
    }
  }

  removePlayer(index: number) {
    this.players.update(p => p.filter((_, i) => i !== index));
  }

  startGame() {
    if (this.players().length < 3) return; 
    this.nextRound();
  }

  nextRound() {
    const players = this.players();
    const wordObj = this.words[Math.floor(Math.random() * this.words.length)];
    const impostorIndex = Math.floor(Math.random() * players.length);

    const newPlayers = players.map((p, i) => ({
      ...p,
      role: (i === impostorIndex ? 'impostor' : 'citizen') as 'citizen' | 'impostor',
      word: i === impostorIndex ? 'IMPOSTOR' : wordObj.word
    }));

    this.players.set(newPlayers);
    this.currentRound.update(r => r + 1);
    this.revealingPlayerIndex.set(0);
    this.gameState.set('REVEAL');
  }
  
  revealNext() {
    const current = this.revealingPlayerIndex();
    if (current < this.players().length - 1) {
      this.revealingPlayerIndex.set(current + 1);
    } else {
      this.gameState.set('PLAYING');
    }
  }

  endRound() {
    this.gameState.set('FINISHED');
  }
  
  resetGame() {
    this.players.set([]);
    this.gameState.set('LOBBY');
    this.currentRound.set(0);
  }
}

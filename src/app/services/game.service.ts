import { Injectable, signal, computed } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface Player {
  name: string;
  role: 'citizen' | 'impostor';
  word: string;
}

export type GameState = 'LOBBY' | 'REVEAL' | 'PLAYING' | 'FINISHED';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  players = signal<Player[]>([]);
  gameState = signal<GameState>('LOBBY');
  currentRound = signal(0);
  isLoading = signal(false);

  // For reveal phase
  revealingPlayerIndex = signal(0);

  private genAI = new GoogleGenerativeAI(environment.apiKey);
  private model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
    { word: 'Flor' },
  ];

  addPlayer(name: string) {
    if (this.players().length < 10) {
      this.players.update((p) => [...p, { name, role: 'citizen', word: '' }]);
    }
  }

  removePlayer(index: number) {
    this.players.update((p) => p.filter((_, i) => i !== index));
  }

  async startGame() {
    if (this.players().length < 3) return;
    await this.nextRound();
  }

  async nextRound() {
    this.isLoading.set(true);
    const players = this.players();
    let word = '';

    try {
      word = await this.generateWord();
    } catch (error) {
      console.error('Error generating word from AI, using fallback:', error);
      const wordObj = this.words[Math.floor(Math.random() * this.words.length)];
      word = wordObj.word;
    }

    const impostorIndex = Math.floor(Math.random() * players.length);

    const newPlayers = players.map((p, i) => ({
      ...p,
      role: (i === impostorIndex ? 'impostor' : 'citizen') as 'citizen' | 'impostor',
      word: i === impostorIndex ? 'IMPOSTOR' : word,
    }));

    this.players.set(newPlayers);
    this.currentRound.update((r) => r + 1);
    this.revealingPlayerIndex.set(0);
    this.gameState.set('REVEAL');
    this.isLoading.set(false);
  }

  private async generateWord(): Promise<string> {
    try {
      const prompt =
        'Palabra aleatoria español (sustantivo común) para juego Spyfall. Común y reconocible. SOLO la palabra.';
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      // Remove any potential punctuation
      text = text.replace(/\./g, '');
      return text;
    } catch (e) {
      throw e;
    }
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

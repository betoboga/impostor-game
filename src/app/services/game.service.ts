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

  // Configuración de partida
  impostorCount = signal(1);
  hintsEnabled = signal(false);

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

  addPlayer(name: string) {
    if (this.players().length < 10) {
      this.players.update((p) => [...p, { name, role: 'citizen', word: '' }]);
    }
  }

  removePlayer(index: number) {
    this.players.update((p) => {
      const newPlayers = p.filter((_, i) => i !== index);
      // Validar que si bajamos de 6 jugadores, solo pueda haber 1 impostor
      if (newPlayers.length < 6 && this.impostorCount() > 1) {
        this.impostorCount.set(1);
      }
      return newPlayers;
    });
  }

  async startGame() {
    if (this.players().length < 3) return;
    await this.nextRound();
  }

  private async generateWord(): Promise<{ word: string; category: string }> {
    try {
      const prompt =
        'Genera una palabra aleatoria en español (sustantivo común) para el juego del Impostor y una categoría muy general que la describa. La categoría no debe revelar directamente la palabra pero sí dar una pista clara. Formato: palabra|categoría. Ejemplo: "ordenador|tecnología". Solo responde con el texto en ese formato.';
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      const [word, category] = text.split('|').map(s => s.trim().replace(/\./g, ''));
      
      if (!word || !category) {
        throw new Error('Formato de respuesta inválido');
      }
      
      return { word, category };
    } catch (e) {
      throw e;
    }
  }

  async nextRound() {
    this.isLoading.set(true);
    const players = this.players();
    let word = '';
    let category = '';

    try {
      const result = await this.generateWord();
      word = result.word;
      category = result.category;
    } catch (error) {
      console.error('Error generating word from AI:', error);
      // Fallback mínimo por seguridad técnica, aunque intentamos siempre usar la IA
      word = 'Pizza';
      category = 'Comida';
    }

    const playerCount = players.length;
    const numImpostors = this.impostorCount();
    const impostorIndices = new Set<number>();
    
    // Seleccionar N impostores aleatorios únicos
    while (impostorIndices.size < numImpostors) {
      impostorIndices.add(Math.floor(Math.random() * playerCount));
    }

    // Generar pista semántica si está habilitada
    const hint = this.hintsEnabled() 
      ? ` (Pista: ${category})` 
      : '';

    const newPlayers = players.map((p, i) => ({
      ...p,
      role: (impostorIndices.has(i) ? 'impostor' : 'citizen') as 'citizen' | 'impostor',
      word: impostorIndices.has(i) ? `IMPOSTOR${hint}` : word,
    }));

    this.players.set(newPlayers);
    this.currentRound.update((r) => r + 1);
    this.revealingPlayerIndex.set(0);
    this.gameState.set('REVEAL');
    this.isLoading.set(false);
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

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
        'Genera una palabra aleatoria en español (sustantivo común) para el juego del Impostor y una pista en forma de una única palabra que sea extremadamente difícil, abstracta o tangencial. No uses características físicas obvias ni categorías. Por ejemplo, si la palabra es "pizza" usa "fracciones" o "compartido" en vez de "horno" o "redondo". Si es "espejo" usa "inverso". Debe ser un reto entender la conexión. Formato: palabra|pista. Solo responde con el texto en ese formato exacto.';
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      // Limpiar posibles bloques de código y asteriscos
      text = text.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').replace(/\*/g, '').trim();
      
      const parts = text.split('|').map(s => s.trim().replace(/\./g, ''));
      const word = parts[0];
      const category = parts[1];
      
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
      // Fallback si la clave de Gemini no es válida o falla la IA
      const fallbacks = [
        { w: 'Gato', h: 'independiente' },
        { w: 'Ordenador', h: 'binario' },
        { w: 'Reloj', h: 'inexorable' },
        { w: 'Montaña', h: 'desnivel' },
        { w: 'Coche', h: 'rutina' },
        { w: 'Teléfono', h: 'distancia' },
        { w: 'Avión', h: 'presión' },
        { w: 'Pizza', h: 'fracciones' }
      ];
      const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      word = randomFallback.w;
      category = randomFallback.h;
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

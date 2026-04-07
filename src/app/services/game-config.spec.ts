import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameService } from './game.service';

// Mock del entorno necesario para que el servicio no falle al instanciarse
vi.mock('../../environments/environment', () => ({
  environment: { apiKey: 'test-key' }
}));

describe('GameService - Lógica de Configuración (Unit Test)', () => {
  let service: GameService;

  beforeEach(() => {
    service = new GameService();
    // Limpiamos el estado
    service.resetGame();
  });

  it('debe validar que 2 impostores requieren al menos 6 jugadores', () => {
    // Añadimos 6 jugadores
    for(let i=0; i<6; i++) service.addPlayer(`P${i}`);
    service.impostorCount.set(2);
    expect(service.impostorCount()).toBe(2);
    
    // Eliminamos uno, debe bajar a 1 impostor
    service.removePlayer(0);
    expect(service.impostorCount()).toBe(1);
  });

  it('debe asignar el número correcto de impostores', async () => {
    for(let i=0; i<6; i++) service.addPlayer(`P${i}`);
    service.impostorCount.set(2);
    
    // Mockeamos el método de la IA para que use el fallback o devuelva algo fijo
    // Pero como tiene un try-catch que usa un array interno, funcionará
    await service.nextRound();
    
    const impostors = service.players().filter(p => p.role === 'impostor');
    expect(impostors.length).toBe(2);
  });

  it('debe formatear la pista correctamente si está habilitada', async () => {
    service.addPlayer('P1');
    service.addPlayer('P2');
    service.addPlayer('P3');
    service.hintsEnabled.set(true);
    
    await service.nextRound();
    
    const impostor = service.players().find(p => p.role === 'impostor');
    // Formato: IMPOSTOR (Pista: Empieza por "X", N letras)
    // Nota: El espacio antes de (Pista...) debe coincidir con el código
    expect(impostor?.word).toContain('IMPOSTOR (Pista: Empieza por "');
    expect(impostor?.word).toMatch(/, \d+ letras\)/);
  });
});

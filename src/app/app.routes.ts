import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { RevealComponent } from './components/reveal/reveal.component';
import { GameComponent } from './components/game/game.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'lobby', component: LobbyComponent },
    { path: 'reveal', component: RevealComponent },
    { path: 'game', component: GameComponent },
    { path: '**', redirectTo: '' }
];

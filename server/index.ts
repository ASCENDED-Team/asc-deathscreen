import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { DEATH_EVENTS } from '../shared/events.js';
import { DEATH_CONFIG } from '../shared/config.js';

const Rebar = useRebar();

alt.on('playerDeath', (player: alt.Player) => {
    Rebar.player.useNative(player).invoke('doScreenFadeOut', DEATH_CONFIG.fadeOutTime);
    alt.setTimeout(() => {
        Rebar.player.useWebview(player).show('Deathscreen', 'page', false);
    }, DEATH_CONFIG.fadeOutTime);
});

alt.on('playerSpawn', (player: alt.Player) => {
    Rebar.player.useNative(player).invoke('doScreenFadeIn', DEATH_CONFIG.fadeInTime);
    Rebar.player.useWebview(player).hide('Deathscreen');
});

alt.onClient(DEATH_EVENTS.ToServer.DIED, (player: alt.Player) => {
    player.spawn(player.pos.x, player.pos.y, player.pos.z);
});

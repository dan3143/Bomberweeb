import MainMenu from './MainMenu.js';
import EndScene from './EndScene.js';
import Game from './Game.js';
import MusicManager from './MusicManager.js';
import WaitRoom from './WaitRoom.js';

var config = {
    type: Phaser.AUTO,
    width: 700,
    height: 600,
    parent: 'game',
    physics:{
        default: 'arcade'
    },
    backgroundColor: '#32698C',
    scene: [MusicManager, MainMenu, Game, EndScene, WaitRoom]
};

var game = new Phaser.Game(config);
import MainMenu from '/src/MainMenu.js';
import Game from '/src/Game.js';
//import Game from 'Game.js';

var config = {
    type: Phaser.AUTO,
    width: 700,
    height: 600,
    parent: 'game',
    physics:{
        default: 'arcade'
    },
    backgroundColor: '#32698C',
    scene: [MainMenu, Game]
};

var game = new Phaser.Game(config);
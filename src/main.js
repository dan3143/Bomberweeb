import MainMenu from '/src/MainMenu.js';
//import Game from 'Game.js';

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    physics:{
        default: 'arcade'
    },
    scene: [MainMenu]
};

var game = new Phaser.Game(config);
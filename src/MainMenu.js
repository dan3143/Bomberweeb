import Game from './Game.js';

export default class MainMenu extends Phaser.Scene {
    
    constructor() {
        super({key: 'MainMenu', active: true});
        this.current_element = -1;
        this.last_element = 1;
    }

    preload() {
        this.load.image('megu', 'assets/megumin.png');
    }

    create() {
        let self = this;
        this.add.text(90, 100, "BomberWeeb", { font: "100px Courier", fill: "#AED7F1" });
        this.startGame = this.add.text(100, 250, 'Comenzar juego', {font: "25px Courier"}).setInteractive({ useHandCursor: true  } );
        this.instructions = this.add.text(100, 300, 'Instrucciones', {font: "25px Courier"}).setInteractive({ useHandCursor: true  } );
        this.startGame.on('pointerover', function(){
            self.startGame.setText("> Comenzar Juego");
        });

        this.startGame.on('pointerout', function(){
            self.startGame.setText("Comenzar Juego");
            self.startGame.setColor("#FFFFFF");
        });

        this.startGame.on('pointerdown', function(){
            self.startGame.setColor("#000000");
            self.scene.start('Game', new Game);
        });

        this.startGame.on('pointerup', function(){
            self.startGame.setColor("#FFFFFF");
        })

        this.instructions.on('pointerover', function(){
            self.instructions.setText("> Instrucciones");
        });

        this.instructions.on('pointerout', function(){
            self.instructions.setText("Instrucciones");
            self.instructions.setColor("#FFFFFF");
        });
        
        this.instructions.on('pointerdown', function(){
            self.instructions.setColor("#000000");
        });
        this.instructions.on('pointerup', function(){
            self.instructions.setColor("#FFFFFF");
        });
    }

    update() {
    }
}
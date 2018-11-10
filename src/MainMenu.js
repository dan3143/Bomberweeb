import Game from './Game.js';

var musicConfig =
    {
        mute: false,
        volume: 0.02,
        rate: 1,
        detune: 0,
        seek: 0,
        loop: true,
        delay: 0
    };

export default class MainMenu extends Phaser.Scene {
    
    constructor() {
        super({key: 'MainMenu', active: true});
        this.current_element = -1;
        this.last_element = 1;
    }

    preload() {
        this.load.image('tiles',"assets/maps/2Gen's 64x64 Mixed Tileset.png");
        this.load.audio('music',"assets/sounds/bomberman.mp3");
    }

    create() {   
        this.initialize();
    }

    update() {
    }

    initialize(){
        const font = { font: "25px Courier", fill: "#AED7F1" };
        this.music = this.sound.add('music',musicConfig);
        this.music.play();
        this.add.text(90, 100, "BomberWeeb", { font: "90px Courier", fill: "#AED7F1" });
        this.startGame = this.add.text(100, 250, 'Comenzar juego', font).setInteractive({ useHandCursor: true  } );
        this.instructions = this.add.text(100, 300, 'Instrucciones', font).setInteractive({ useHandCursor: true  } );
        this.sound = this.add.text(530, 550, 'Sound: ', font);
        this.setSound= this.add.text(625,550,'On', font).setInteractive({useHandCursor: true});
        this.socket = io();
        this.assignEvents();
    }

    assignEvents(){
        
        let self = this;
        /*
        this.setSound.on('pointerover', function(){
            self.setSound.setText("Off");
        });
        this.setSound.on('pointerout', function(){
            self.setSound.setText("On");
            self.setSound.setColor("#FFFFFF");
        })*/
        this.setSound.on('pointerdown', function(){
            if(self.setSound.text === "Off"){
                self.setSound.setText("On");
                self.setSound.setColor("#FFFFFF");
                self.music.resume();
            }else{
                self.setSound.setText("Off");
                self.music.pause();
            }
        });
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
            self.socket.disconnect();
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
}
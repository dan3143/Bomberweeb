export default class WaitRoom extends Phaser.Scene {
    constructor(){
        super({key: 'WaitRoom'});
    }
    create(){
        var self = this;
        this.socket = io();
        this.socket.emit('playerWaiting');
        this.add.text(100, 100, 'Sala de espera', {font: '50px Courier'});
        this.restantesText = self.add.text(100, 200, 'Falta un jugador...', {font:'30px Courier'});
        this.go = self.add.text(100, 300, 'GO!', {font:'30px Courirer'}).setInteractive({ useHandCursor: true  } );
        this.go.setVisible(false);
        
        this.go.on('pointerover', function(){
            self.go.setText("> GO! <");
            self.go.x-=25;
        });

        this.socket.on('go', function(){
            self.go.setVisible(false);
            self.scene.start('Game');
            self.socket.disconnect();
        });

        this.go.on('pointerout', function(){
            self.go.setText("GO!");
            self.go.x+=25;
            self.go.setColor("#FFFFFF");
        });

        this.go.on('pointerdown', function(){
            self.go.setColor("#000000");
            self.socket.emit('ready');
            self.scene.start('Game');
            self.socket.disconnect();
        });

        this.go.on('pointerup', function(){
            self.go.setColor("#FFFFFF");
        });
        
        this.socket.on('allPlayersReady', function(){
            self.restantesText.setText('Jugadores completos');
            self.go.setVisible(true);
        });

        this.socket.on('notAllPlayersReady', function(){
            self.restantesText.setText('Falta un jugador...');
            console.log('Someone disconnected');
            self.go.setVisible(false);
        })
    }
}
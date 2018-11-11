export default class MusicManager extends Phaser.Scene {
    constructor(){
        super({key: 'MusicManager', active: true});
    }
    preload(){
        this.load.audio('music',"assets/sounds/bomberman.mp3");
    }
    create(){
        var config = {
            mute: false,
            volume: 0.02,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        };
        this.music = this.sound.add('music', config);
        this.music.play();
        this.sound = this.add.text(530, 550, 'Sound: ', { font: "25px Courier", fill: "#AED7F1" });
        this.setSound= this.add.text(625,550,'On', { font: "25px Courier", fill: "#AED7F1" }).setInteractive({useHandCursor: true});
        var self = this;
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
    }
}
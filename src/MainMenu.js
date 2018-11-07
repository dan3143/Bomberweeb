export default class MainMenu extends Phaser.Scene {
    
    constructor() {
        super({key: 'MainMenu', active: true});
    }

    preload() {
        this.load.image('gameTitles', 'assets/bombermanmap.json');
    }

    create() {
        
    }

    update() {

    }

}
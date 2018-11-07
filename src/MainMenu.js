export default class MainMenu extends Phaser.Scene {

    constructor() {
        super({ key: 'MainMenu', active: true });
    }

    preload() {

    }


    create() {
        this.add.text(100, 100, "BomberWeeb", { font: "100px Courier", fill: "#AED7F1" });
    }
    //let.graphics = this.add.graphics();
    //graphics.fillStyle(0xff9999,1);




    update() {
    }

}
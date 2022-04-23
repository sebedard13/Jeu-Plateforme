import {jeu} from "./script.js";
import {checkCollide} from "./Jeu.js";

export class Sortie extends createjs.Bitmap {
    functionToCall: any;
    private collisionBox: createjs.Bitmap;

    constructor() {
        super(jeu.chargeur.getResult("sortie"));
        jeu.stage.addChild(this);
        this.functionToCall;
        this.collisionBox = new createjs.Bitmap(jeu.chargeur.getResult("hitBoxSortie"));
        this.collisionBox.regX = this.collisionBox.getBounds().width / 2;
        this.collisionBox.regY = this.collisionBox.getBounds().height / 2 ;
        this.collisionBox.alpha = 0;
        jeu.stage.addChild( this.collisionBox);
        this.actualiser = this.actualiser.bind(this);
        this.addEventListener("tick", this.actualiser);
    }

    moveTo(x: number, y: number){
        //Fonction pour déplacer l'objet et arranger la boite de collision
        this.x = x;
        this.y = y;
        this.collisionBox.x = x+56 + this.collisionBox.getBounds().width/2;
        this.collisionBox.y = y+74 + this.collisionBox.getBounds().height/2;
    }

    actualiser(){
        //Si le joueur collisione avec, tu appelle la fonction.
        if (checkCollide(jeu.perso.collisionBox.getTransformedBounds(), this.collisionBox.getTransformedBounds())){
            createjs.Sound.play("sortieSons");
            this.functionToCall()
        }
    }




}


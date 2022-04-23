import {jeu} from "./script.js";
import {checkCollide} from "./Jeu.js";


export class Ennemi extends createjs.Sprite {
    private vitesse: number;
    private xMin: number;
    private xMax: number;
    private avancer: any;

    constructor(atlas: any, xMin: number, xMax: number) {
        super(atlas);
        this.vitesse = -4;
        this.xMin = xMin;
        this.xMax = xMax;
        this.gotoAndPlay("avancer");
        this.avancer = this.fAvancer.bind(this);
        this.addEventListener("tick", this.avancer);
    }

    moveTo(x: number, y: number){
        //Fonction pour déplacer l'objet et arranger le max et minx
        this.x = x;
        this.y = y;

        this.xMin += x;
        this.xMax += x;
    }

    fAvancer(){
        //Actualiser pour le faire avancer
        if(jeu.enJeu) {
            this.x += this.vitesse;

            //Le faire retourner
            if (this.x <= this.xMin) {
                this.scaleX = -1;
                this.vitesse *= -1;
            } else if (this.x >= this.xMax) {
                this.scaleX = 1;
                this.vitesse *= -1;
            }

            //Si collision avec joueur, tu perds
            if (checkCollide(jeu.perso.collisionBox.getTransformedBounds(), this.getTransformedBounds())) {
                jeu.fToLost();
            }
        }
        else{
            this.gotoAndStop("avancer");
        }

    }


}
import {jeu} from "./script.js";

export class Ennemi extends createjs.Sprite {

    constructor(atlas, xMin, xMax) {
        super(atlas);
        this.vitesse = -4;
        this.xMin = xMin;
        this.xMax = xMax;
        this.gotoAndPlay("avancer");
        this.avancer = this.fAvancer.bind(this);
        this.addEventListener("tick", this.avancer);
    }

    moveTo(x,y){
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
            if (ndgmr.checkRectCollision(jeu.perso.collisionBox, this)) {
                jeu.fToLost();
            }
        }
        else{
            this.gotoAndStop("avancer");
        }

    }



}
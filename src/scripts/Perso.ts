import {jeu} from "./main";
import {checkCollide} from "./Jeu";

const vitesseEfficaceX = 9;
const viteseEfficaceSaut = -26 ;

export class Perso extends createjs.Sprite {
    private aTerre: boolean;
    private direction: string;
    private vitesseX : number;
    private vitesseY : number;
    public collisionBox: createjs.Bitmap;
    private fBouger: any;

    constructor(atlas: createjs.SpriteSheet) {
        //Construction Perso, variable et fonction
        super(atlas);

        this.gotoAndStop("marcher");
        this.aTerre = false;
        this.direction = "d";  //les possibilités sont : "d", "g"

        jeu.stage.addChild(this);

        this.vitesseX = 0;
        this.vitesseY = 0;

        //L'image Utilisé pour la collision
        this.collisionBox = new createjs.Bitmap(jeu.chargeur.getResult("hitBoxPerso"));
        this.collisionBox.regX = this.collisionBox.getBounds().width / 2;
        this.collisionBox.regY = this.collisionBox.getBounds().height / 2 ;
        this.collisionBox.alpha = 0;
        jeu.stage.addChild( this.collisionBox);

        window.addEventListener("keydown", this.gererTouchePesee.bind(this));
        window.addEventListener("keyup", this.gererToucheLachee.bind(this));

        this.fBouger = this.fActualiser.bind(this);
        this.addEventListener("tick", this.fBouger);

    }

    gererTouchePesee(e: { key: string; }) {
        //Gère "keydown" pour ordi et va vers la bonne fonction
        if (e.key === "ArrowRight") {
            this.marcherD()
        } else if (e.key === "ArrowLeft") {
            this.marcherG()
        }
        if (e.key === "ArrowUp") {
            this.sauter()
        }
    }

    gererToucheLachee(e: { key: string; }) {
        //Gère "keyup" pour ordi
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            this.mouseUpMarcher()
        }
    }

    sauter(){
        //Jump
        if(this.aTerre)
        {
            createjs.Sound.play("sauter", {
                volume: 0.6});
            this.vitesseY = viteseEfficaceSaut;
            this.aTerre= false
        }
    }

    marcherD(){
        //Marcher à droite
        this.direction = "d";
        this.vitesseX = vitesseEfficaceX;
    }

    marcherG(){
        //Marcher à gauche
        this.direction = "g";
        this.vitesseX = -vitesseEfficaceX;
    }

    mouseUpMarcher(){
        //Quand tu ne marche pu
        this.vitesseX = 0;
    }

    fActualiser(){
        //Actualise pour les mouvements, la gravité et les collisions.
        if(jeu.enJeu){
            //Arrange la gravité
            this.vitesseY+=1.9;
            this.aTerre= false;
            if(this.vitesseY>35){
                this.vitesseY = 35;
            }

            //Positionne le perso selon sa vitesse
            this.x += this.vitesseX;
            this.y += this.vitesseY;

            //Arrange la boite de collision avec la position selon l'image
            if(this.direction === "d"){
                this.collisionBox.x  = this.x - 16;
                this.collisionBox.y = this.y;
            }
            else if(this.direction === "g") {
                this.collisionBox.x  = this.x + 16;
                this.collisionBox.y = this.y;
            }

            //Arrange l'animation selon ce qui fait
            if(this.vitesseX === 0)
            {
                this.gotoAndPlay("marcher");
                this.stop();
            }
            else if(this.vitesseX>0){
                this.scaleX = 1;
                this.play();
            }
            else if(this.vitesseX<0) {
                this.scaleX = -1;
                this.play();
            }

            //Collision avec le sol
            jeu.plateformes.children.forEach(function (element: createjs.DisplayObject) {
                    if (checkCollide(element.getTransformedBounds(), this.collisionBox.getTransformedBounds())) {
                        //Calcule pente par rapport au bloc
                        let differancX = this.collisionBox.x - element.x;
                        let differancY = this.collisionBox.y - element.y;
                        let pente = differancY/differancX;

                        //Que faire dépendament de la pente
                         if(pente< 1 && pente>-1){
                             //Calcule pur savoir combien faut décaller
                             let differance;
                             let regBrasDeDistance = this.collisionBox.regX + element.regX;
                             let brasEnCeMoment =  element.x - this.collisionBox.x;
                             differance = regBrasDeDistance - Math.abs(brasEnCeMoment);

                             //Séparer le gauche  et droite et ajuster sur la boite de collision
                             if(brasEnCeMoment > 0)
                             {
                                 this.collisionBox.x -= differance
                             }
                             else {
                                 this.collisionBox.x += differance
                             }
                        }
                        else if(pente> 1 || pente<-1){

                            //Que faire quand il est au sol;
                            this.vitesseY *= 0.50;
                            this.aTerre = true;

                            let differance;
                            let regBrasDeDistance = this.collisionBox.regY + element.regY;
                            let brasEnCeMoment =  element.y - this.collisionBox.y;
                            differance = regBrasDeDistance - Math.abs(brasEnCeMoment);

                            if(brasEnCeMoment > 0)
                            {
                                this.collisionBox.y -= differance
                            }
                            else {
                                this.collisionBox.y += differance
                            }
                        }

                        else if(this.collisionBox.y === element.y)
                        {
                            let differance;
                            let regBrasDeDistance = this.collisionBox.regX + element.regX;
                            let brasEnCeMoment =  element.x - this.collisionBox.x;
                            differance = regBrasDeDistance - Math.abs(brasEnCeMoment);

                            if(brasEnCeMoment > 0)
                            {
                                this.collisionBox.x -= differance
                            }
                            else {
                                this.collisionBox.x += differance
                            }
                        }
                        else if(this.collisionBox.x === element.x)
                        {
                            this.vitesseY *= 0.50;
                            this.aTerre = true;

                            let differance;
                            let regBrasDeDistance = this.collisionBox.regY + element.regY;
                            let brasEnCeMoment =  element.y - this.collisionBox.y;
                            differance = regBrasDeDistance - Math.abs(brasEnCeMoment);

                            if(brasEnCeMoment > 0)
                            {
                                this.collisionBox.y -= differance
                            }
                            else {
                                this.collisionBox.y += differance
                            }
                        }

                        //Ajouster les effets sur l'image.
                        if(this.direction === "d")
                        {
                            this.x = this.collisionBox.x + 16;
                            this.y = this.collisionBox.y;
                        }
                        else if(this.direction === "g")
                        {
                            this.x = this.collisionBox.x - 16;
                            this.y = this.collisionBox.y;
                        }

                    }
            }.bind(this));

            //Ne pas le faire sortir du stage
            if (this.x < 0)
            {
              this.x = 0;
            }
            else if (this.x > jeu._width)
            {
              this.x = jeu._width;
            }

            //Si il tombe hors du stage, tu perds
            if(this.y > jeu._height)
            {
                jeu.fToLost();
            }
        }
    }
}
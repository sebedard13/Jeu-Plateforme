import {Sortie} from "./Sortie";
import {Perso} from "./Perso";
import {Ennemi} from "./Ennemi";


export class Jeu {
    private parametres: { manifeste: string; cadence: number; canevas: string };
    enJeu: boolean;
    plateformes: createjs.Container;
    private level: createjs.Container;
    chargeur: createjs.LoadQueue;
    stage: createjs.StageGL;
    private actualiser: any;
    private music: any;
    private sortie: Sortie;
    perso: Perso;
    private UI: createjs.Container;
    private containFin: createjs.Container;
    _height: number;
    _width: number;
    constructor() {
        this.parametres = {
            canevas: "canvas",
            cadence: 30,
            manifeste: "ressources/manifest.json"
        };

        this.enJeu = false;
        this.plateformes = new createjs.Container();
        this.level = new createjs.Container();
    }

    fCharger() {
        this.chargeur = new createjs.LoadQueue();
        this.chargeur.installPlugin(createjs.Sound);
        this.chargeur.addEventListener("complete", this.fInitialiser.bind(this));
        this.chargeur.addEventListener('error', this.fAbandonner);
        this.chargeur.loadManifest(this.parametres.manifeste);
    }

    fAbandonner() {
        alert("Une erreur de chargement est survenue! Rechargez la page.");
    }

    fInitialiser() {
        this.stage = new createjs.StageGL(this.parametres.canevas, {antialias: true});
        if ("height" in this.stage.canvas) {
            this._height = this.stage.canvas.height
        }
        // @ts-ignore
        this._width = this.stage.canvas.width;
        createjs.Touch.enable(this.stage);

        this.actualiser = this.fActualiser.bind(this);

        createjs.Ticker.addEventListener("tick", this.actualiser);
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
        createjs.Ticker.framerate = this.parametres.cadence;
        this.fAnimation();
    }

    fActualiser(e: any) {
        this.stage.update(e);

        // console.clear();
        // console.log(this.level.numChildren);
        // console.log(this.plateformes.numChildren);
        // console.log(this.stage.numChildren);
    }

    fAnimation(){
        //Fait l'animation de Début
        // @ts-ignore
        this.stage.setClearColor("#000");

        let persoAnim = new createjs.Sprite(<createjs.SpriteSheet>this.chargeur.getResult("perso2"));
        persoAnim.gotoAndPlay("marcher");
        persoAnim.y = this._height/2;
        persoAnim.x = 213;
        this.stage.addChild(persoAnim);

        let intro = new createjs.Bitmap(this.chargeur.getResult("intro"));
        intro.regX = intro.getBounds().width/2;
        intro.regY = intro.getBounds().height/2;
        intro.y = this._height*2/3;
        intro.x = this._width/2;
        this.stage.addChild(intro);

        createjs.Tween.get(persoAnim).to({x:925}, 3000).call(this.fDemarrer.bind(this));
    }

    fDemarrer() {
        //Initialise le jeu, les variables, le UI etc.

        //Musique
        this.music = createjs.Sound.play("music",{
            loop: -1,
            volume: 0.2}
            );
        document.addEventListener("visibilitychange", this.fChangeVisibility.bind(this));

        //Fond
        const fond = new createjs.Bitmap(this.chargeur.getResult("fond"));
        this.stage.addChild(fond);

        //Hiéarchie Level
        this.level.addChild(this.plateformes);
        this.stage.addChild(this.level);

        //Éléments commun dans le jeu
        this.sortie = new Sortie();
        this.perso = new Perso(<createjs.SpriteSheet>this.chargeur.getResult("perso2"));

        //User Interface
        this.UI = new createjs.Container();
        let boutonU = new createjs.Bitmap(this.chargeur.getResult("boutonU"));
        boutonU.x = 45;
        boutonU.y = 600;
        boutonU.addEventListener("mousedown", this.perso.sauter.bind(this.perso));
        this.UI.addChild(boutonU);

        let boutonL = new createjs.Bitmap(this.chargeur.getResult("boutonL"));
        boutonL.x = 888;
        boutonL.y = 600;
        boutonL.addEventListener("mousedown", this.perso.marcherG.bind(this.perso));
        boutonL.addEventListener("pressup", this.perso.mouseUpMarcher.bind(this.perso));
        this.UI.addChild(boutonL);

        let boutonR = new createjs.Bitmap(this.chargeur.getResult("boutonR"));
        boutonR.x = 1008;
        boutonR.y = 600;
        boutonR.addEventListener("mousedown", this.perso.marcherD.bind(this.perso));
        boutonR.addEventListener("pressup", this.perso.mouseUpMarcher.bind(this.perso));
        this.UI.addChild(boutonR);

        let boutonRejouer = new createjs.Bitmap(this.chargeur.getResult("boutonRejouer"));
        boutonRejouer.x = 1068;
        boutonRejouer.y = 10;
        boutonRejouer.addEventListener("click", function () {
            if(this.enJeu){
                createjs.Sound.play("click",{
                    volume: 1}
                );
                this.loadLevel1();
            }
        }.bind(this));
        this.UI.addChild(boutonRejouer);

        //Pop et Instruction
        this.containFin = new createjs.Container();
        this.UI.addChild(this.containFin);

        let objet =  new createjs.Bitmap(this.chargeur.getResult("fondu"));
        objet.scaleX = 50;
        objet.scaleY = 50;
        objet.alpha = 0.5;
        this.containFin.addChild(objet);

        objet =  new createjs.Bitmap(this.chargeur.getResult("instruction"));
        objet.regX = objet.getBounds().width/2;
        objet.regY = objet.getBounds().height/2;
        objet.y = this._height/2;
        objet.x = this._width /2;
        this.containFin.addChild(objet);

        objet =  new createjs.Bitmap(this.chargeur.getResult("btCheck"));
        objet.regX = objet.getBounds().width/2;
        objet.regY = objet.getBounds().height/2;
        objet.y = this._height - 110;
        objet.x = this._width /2;
        objet.addEventListener("click", function () {
            this.containFin.removeAllChildren();
            createjs.Sound.play("click",{
                volume: 1}
            );
            this.enJeu = true;
        }.bind(this));
        this.containFin.addChild(objet);

        this.stage.addChild(this.UI);

        //Level 1;
        this.loadLevel1()

    }

    fChangeVisibility(){
        this.music.paused = !this.music.paused;
        createjs.Ticker.paused = !createjs.Ticker.paused;
    }

    loadLevel1(){
        //Load level 1
        this.plateformes.removeAllChildren();
        this.level.removeAllChildren();

        let objet;

        objet = new createjs.Bitmap(this.chargeur.getResult("buisson"));
        objet.regX = objet.getBounds().width/2;
        objet.regY = objet.getBounds().height/2;
        objet.y = 390 + objet.getBounds().height/2;
        objet.x = 262  + objet.getBounds().width/2;
        this.level.addChild(objet);

        for (let i =0; i<3; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("gazon"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 568 + objet.getBounds().width/2;
            objet.x = i*objet.getBounds().width + objet.getBounds().width/2;
            this.plateformes.addChild(objet);
        }

        objet = new createjs.Bitmap(this.chargeur.getResult("gazon2"));
        objet.regX = objet.getBounds().width/2;
        objet.regY = objet.getBounds().height/2;
        objet.y = 355 + objet.getBounds().height/2;
        objet.x = 71  + objet.getBounds().width/2;
        this.plateformes.addChild(objet);

        for (let i =0; i<9; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("gazon"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 497 + objet.getBounds().width/2;
            objet.x = 213 + i*objet.getBounds().width + objet.getBounds().width/2;
            this.plateformes.addChild(objet);
        }

        for (let i =0; i<9; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("bloc1"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 568 + objet.getBounds().width/2;
            objet.x = 213 + i*objet.getBounds().width + objet.getBounds().width/2;
            this.level.addChild(objet);
        }

        for (let i =0; i<5; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("gazon"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 568 + objet.getBounds().width/2;
            objet.x = 852 + i*objet.getBounds().width + objet.getBounds().width/2;
            this.plateformes.addChild(objet);
        }
        for (let i =0; i<17; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("bloc2"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 639 + objet.getBounds().width/2;
            objet.x = i*objet.getBounds().width + objet.getBounds().width/2;
            this.level.addChild(objet);
        }

        objet = new createjs.Bitmap(this.chargeur.getResult("gazon2"));
        objet.regX = objet.getBounds().width/2;
        objet.regY = objet.getBounds().height/2;
        objet.y = 284 + objet.getBounds().height/2;
        objet.x = 284  + objet.getBounds().width/2;
        this.plateformes.addChild(objet);

        for (let i =0; i<5; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("bloc2"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 284 + objet.getBounds().width/2;
            objet.x = 355  + i*objet.getBounds().width + objet.getBounds().width/2;
            this.plateformes.addChild(objet);
        }

        objet = new createjs.Bitmap(this.chargeur.getResult("gazon2"));
        objet.regX = objet.getBounds().width/2;
        objet.regY = objet.getBounds().height/2;
        objet.y = 284 + objet.getBounds().height/2;
        objet.x = 710  + objet.getBounds().width/2;
        this.plateformes.addChild(objet);

        for (let i =0; i<2; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("gazon"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 213 + objet.getBounds().width/2;
            objet.x = 355  + i*objet.getBounds().width + objet.getBounds().width/2;
            this.plateformes.addChild(objet);
        }

        objet = new createjs.Bitmap(this.chargeur.getResult("bloc1"));
        objet.regX = objet.getBounds().width/2;
        objet.regY = objet.getBounds().height/2;
        objet.y = 213 + objet.getBounds().height/2;
        objet.x = 497  + objet.getBounds().width/2;
        this.level.addChild(objet);

        for (let i =0; i<2; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("gazon"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 213 + objet.getBounds().height/2;
            objet.x =  568 + i*objet.getBounds().width + objet.getBounds().width/2;
            this.plateformes.addChild(objet);
        }

        objet = new createjs.Bitmap(this.chargeur.getResult("gazon"));
        objet.regX = objet.getBounds().width/2;
        objet.regY = objet.getBounds().height/2;
        objet.y = 142 + objet.getBounds().height/2;
        objet.x = 497  + objet.getBounds().width/2;
        this.plateformes.addChild(objet);

        this.perso.x = 27 + this.perso.getBounds().width/2;
        this.perso.y = 470 + this.perso.getBounds().height/2;


        this.sortie.moveTo(942,385);
        this.sortie.functionToCall = this.loadLevel2.bind(this);

        this.level.addChild(this.plateformes);

    }

    loadLevel2(){
        //Load level 2

        this.plateformes.removeAllChildren();
        this.level.removeAllChildren();
        let objet;

        objet = new createjs.Bitmap(this.chargeur.getResult("arbre"));
        objet.regX = objet.getBounds().width/2;
        objet.regY = objet.getBounds().height/2;
        objet.y = 221 + objet.getBounds().height/2;
        objet.x = 211  + objet.getBounds().width/2;
        this.level.addChild(objet);

        for (let i =0; i<2; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("gazon"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 568 + objet.getBounds().width/2;
            objet.x = i*objet.getBounds().width + objet.getBounds().width/2;
            this.plateformes.addChild(objet);
        }

        for (let i =0; i<2; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("bloc2"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 639 + objet.getBounds().width/2;
            objet.x = i*objet.getBounds().width + objet.getBounds().width/2;
            this.level.addChild(objet);
        }

        for (let i =0; i<3; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("gazon"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 497 + objet.getBounds().width/2;
            objet.x = 213 + i*objet.getBounds().width + objet.getBounds().width/2;
            this.plateformes.addChild(objet);
        }

        for (let i =0; i<3; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("bloc1"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 568 + objet.getBounds().width/2;
            objet.x = 213 + i*objet.getBounds().width + objet.getBounds().width/2;
            this.level.addChild(objet);
        }

        for (let i =0; i<3; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("bloc2"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 639 + objet.getBounds().width/2;
            objet.x = 213 + i*objet.getBounds().width + objet.getBounds().width/2;
            this.level.addChild(objet);
        }

        for (let i =0; i<2; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("gazon"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 355 + objet.getBounds().width/2;
            objet.x = 568 + i*objet.getBounds().width + objet.getBounds().width/2;
            this.plateformes.addChild(objet);
        }

        for (let i =0; i<2; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("bloc2"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 426 + objet.getBounds().width/2;
            objet.x = 568 + i*objet.getBounds().width + objet.getBounds().width/2;
            this.level.addChild(objet);
        }


        for (let i =0; i<5; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("gazon"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 213 + objet.getBounds().width/2;
            objet.x = 852 + i*objet.getBounds().width + objet.getBounds().width/2;
            this.plateformes.addChild(objet);
        }

        for (let i =0; i<5; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("bloc1"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 284 + objet.getBounds().width/2;
            objet.x = 852 + i*objet.getBounds().width + objet.getBounds().width/2;
            this.level.addChild(objet);
        }

        for (let i =0; i<5; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("bloc2"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 355 + objet.getBounds().width/2;
            objet.x = 852 + i*objet.getBounds().width + objet.getBounds().width/2;
            this.level.addChild(objet);
        }

        this.perso.x = 27 + this.perso.getBounds().width/2;
        this.perso.y = 470 + this.perso.getBounds().height/2;

        this.sortie.moveTo(900,26);
        this.sortie.functionToCall = this.loadLevel3.bind(this);

        this.level.addChild(this.plateformes);
    }

    loadLevel3(){
        //Load level3
        this.plateformes.removeAllChildren();
        this.level.removeAllChildren();
        let objet;

        objet = new createjs.Bitmap(this.chargeur.getResult("buisson"));
        objet.regX = objet.getBounds().width/2;
        objet.regY = objet.getBounds().height/2;
        objet.y = 326 + objet.getBounds().height/2;
        objet.x = 295  + objet.getBounds().width/2;
        this.level.addChild(objet);

        for (let i =0; i<2; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("gazon"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 426 + objet.getBounds().width/2;
            objet.x = i*objet.getBounds().width + objet.getBounds().width/2;
            this.plateformes.addChild(objet);
        }

        for (let i =0; i<2; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("bloc1"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 497 + objet.getBounds().width/2;
            objet.x = i*objet.getBounds().width + objet.getBounds().width/2;
            this.level.addChild(objet);
        }

        for (let i =0; i<2; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("bloc1"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 568 + objet.getBounds().width/2;
            objet.x = i*objet.getBounds().width + objet.getBounds().width/2;
            this.level.addChild(objet);
        }

        for (let i =0; i<2; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("bloc2"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 639 + objet.getBounds().width/2;
            objet.x = i*objet.getBounds().width + objet.getBounds().width/2;
            this.level.addChild(objet);
        }


        for (let i =0; i<4; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("gazon2"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 426 + objet.getBounds().width/2;
            objet.x = 213 + i*objet.getBounds().width + objet.getBounds().width/2;
            this.plateformes.addChild(objet);
        }

        for (let i =0; i<2; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("gazon2"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 284 + objet.getBounds().width/2;
            objet.x = 568 + i*objet.getBounds().width + objet.getBounds().width/2;
            this.plateformes.addChild(objet);
        }

        for (let i =0; i<9; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("gazon"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 497 + objet.getBounds().width/2;
            objet.x = 568 + i*objet.getBounds().width + objet.getBounds().width/2;
            this.plateformes.addChild(objet);
        }

        for (let i =0; i<9; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("bloc1"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 568 + objet.getBounds().width/2;
            objet.x = 568 + i*objet.getBounds().width + objet.getBounds().width/2;
            this.level.addChild(objet);
        }

        for (let i =0; i<9; i++)
        {
            objet = new createjs.Bitmap(this.chargeur.getResult("bloc2"));
            objet.regX = objet.getBounds().width/2;
            objet.regY = objet.getBounds().height/2;
            objet.y = 639 + objet.getBounds().width/2;
            objet.x = 568 + i*objet.getBounds().width + objet.getBounds().width/2;
            this.level.addChild(objet);
        }

        objet = new Ennemi(this.chargeur.getResult("dino"), -97, 178);
        objet.moveTo(285 +objet.getBounds().width/2, 357);
        objet.regX = objet.getBounds().width/2;
        this.level.addChild(objet);

        objet = new Ennemi(this.chargeur.getResult("dino"), -210, 73);
        objet.moveTo(746 +objet.getBounds().width/2, 430);
        objet.regX = objet.getBounds().width/2;
        this.level.addChild(objet);


        this.perso.x = 27 + this.perso.getBounds().width/2;
        this.perso.y = 330 + this.perso.getBounds().height/2;

        this.sortie.moveTo(900,314);
        this.sortie.functionToCall = this.fToWin.bind(this);

        this.level.addChild(this.plateformes);
    }



    fToLost(){
        //Quand perd
        createjs.Sound.play("hit",{
            volume: 1}
        );

        this.perso.y = this._height/2;
        this.perso.x = this._width/2;
        this.perso.collisionBox.y = this._height/2;
        this.perso.collisionBox.x = this._width/2;
        //this.perso.removeEventListener("tick",  this.perso.fBouger);

        this.enJeu = false;

        let objet;

        objet =  new createjs.Bitmap(this.chargeur.getResult("fondu"));
        objet.scaleX = 50;
        objet.scaleY = 50;
        objet.alpha = 0.5;
        // console.log(objet);
        this.containFin.addChild(objet);


        objet = new createjs.Bitmap(this.chargeur.getResult("lost"));
        objet.regX = objet.getBounds().width/2;
        objet.regY = objet.getBounds().height/2;
        objet.y = this._height /2;
        objet.x = this._width /2;
        this.containFin.addChild(objet);

        objet = new createjs.Bitmap(this.chargeur.getResult("bigRecom"));
        objet.regX = objet.getBounds().width/2;
        objet.regY = objet.getBounds().height/2;
        objet.y = this._height - 135;
        objet.x = this._width /2;
        objet.addEventListener("click", this.fRecommencer.bind(this));
        this.containFin.addChild(objet);
    }

    fToWin(){
        //Quand gagner
        this.perso.y = this._height/2;
        this.perso.x = this._width/2;
        this.perso.collisionBox.y = this._height/2;
        this.perso.collisionBox.x = this._width/2;

        this.enJeu = false;

        let objet;

        objet =  new createjs.Bitmap(this.chargeur.getResult("fondu"));
        objet.scaleX = 50;
        objet.scaleY = 50;
        objet.alpha = 0.5;

        this.containFin.addChild(objet);


        objet = new createjs.Bitmap(this.chargeur.getResult("win"));
        objet.regX = objet.getBounds().width/2;
        objet.regY = objet.getBounds().height/2;
        objet.y = this._height /2;
        objet.x = this._width /2;
        this.containFin.addChild(objet);

        objet = new createjs.Bitmap(this.chargeur.getResult("bigRecom"));
        objet.regX = objet.getBounds().width/2;
        objet.regY = objet.getBounds().height/2;
        objet.y = this._height - 135;
        objet.x = this._width /2;
        objet.addEventListener("click", this.fRecommencer.bind(this));
        this.containFin.addChild(objet);
    }

    fRecommencer(){
        //Recommencer Jeu
        createjs.Sound.play("click",{
            volume: 1}
        );

        this.containFin.removeAllChildren();
        this.enJeu = true;
        this.loadLevel1()
    }
}

export function checkCollide(rect1: createjs.Rectangle, rect2: createjs.Rectangle) {
    return !(((rect1.y + rect1.height) < (rect2.y)) ||
        (rect1.y > (rect2.y + rect2.height)) ||
        ((rect1.x + rect1.width) < rect2.x) ||
        (rect1.x > (rect2.x + rect2.width)));
}
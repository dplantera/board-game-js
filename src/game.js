
import Board from "./board";
import BuildingFactory from "./buildingFactory";

const GAME_PHASES = {
    NOTINITALISED: 0,
    POPULATE: 1,
    START: 2
}

export default class Game {
    constructor(players) {
        this.div = document.getElementById("game");
        this.board = new Board(this);
        this.players = players;
        this.buildingState = [[]];

        this.GAME_PHASES = GAME_PHASES;
        this.currentPhase = GAME_PHASES.NOTINITALISED;
    }

    createBuildingState() {
        let state = new Array(23);
        for(var i=0; i < state.length; i++) {
            state[i] = new Array(23);
        }
        return state;
    }

    init() {
        this.buildingState = this.createBuildingState()
        this.board.init();
        this.initPlayerArea();

        this.currentPhase = GAME_PHASES.POPULATE;
    }

    initPlayerArea() {
        let bf = new BuildingFactory();
        let allGameObjects = {};
        this.players.forEach((p) => {
            allGameObjects = {
                villages: bf.createVillages(this, p, 5),
                streets: bf.createStreets(this, p, 15),
            }
        } )

        for(var gameObjects in allGameObjects) {
            for (var gameObject of allGameObjects[gameObjects]){
                gameObject.draw();
            }
        }
    }
    draw() {
        this.board.draw();
    }
}
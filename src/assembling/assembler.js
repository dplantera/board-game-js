import State from "../state";
import Player from "../player";
import Board from "../components/board-component/board";
import Game from "../components/game-component/game";
import ResourceArea from "../components/resourcearea-component/resourceArea";
import SlotFactory from "./slotFactory";
import BuildingFactory from "./buildingFactory";
import ResourceFactory from "./resourceFactory";
import 'regenerator-runtime/runtime'

export function assemble(playerData) {
    let game = new Game({ state: new State() }).init();
    game.players = assemblePlayers(game, playerData);
    game.board = assembleBoard(game);

    let resourceArea = assembleResourceArea(game);

    // debug: select
    let select = document.getElementsByName("change-state")[0];
    for (let phase in game.GAME_PHASES) {
        var option = document.createElement("option");
        option.text = phase;
        option.id = game.GAME_PHASES[phase];
        select.add(option);
    }
    select.onchange = function (e) {
        this.currentPhase = this.GAME_PHASES[e.target.value];
    }.bind(game);
    select.options[game.currentPhase].selected = true;

    // header - todo: extract
    window.onscroll = function () {
        var header = document.getElementById("header");
        var sticky = header.offsetTop;

        if (window.pageYOffset + 1 > sticky) {
            header.classList.add("sticky");
        }
        else {
            header.classList.remove("sticky");
        }
    }

    return { game, resourceArea };
}

function assembleBoard(game) {
    let sf = new SlotFactory(game);
    return new Board(
        {
            buildingSlots: sf.makeBuildingSlots(),
            resourceSlots: sf.makeRessourceSlots()
        }
    );
}

function assemblePlayers(game, playerData) {
    let bf = new BuildingFactory();
    let players = [];
    for (var player in playerData) {
        let newPlayer = new Player(game, player.name)
        newPlayer.gameObjects = {
            towns: bf.createTowns(newPlayer, 4),
            villages: bf.createVillages(newPlayer, 5),
            streets: bf.createStreets(newPlayer, 15),
        }

        players.push(newPlayer)
    }

    return players;
}

function assembleResourceArea(game) {
    // resources to load
    let rf = new ResourceFactory(game);
    let resources = {
        ore: rf.createOre(3),
        corn: rf.createCorn(4),
        stone: rf.createStone(3),
        wool: rf.createWool(4),
        wood: rf.createWood(4),
        dessert: rf.createDessert(1),
    };
    let resourceArea = new ResourceArea(game, resources);

    // let us stack the resources in a cirle way 
    function* transformPos() {
        let i = 0;
        while (true) {
            while (i++ < 3) yield "marginLeft";
            while (i-- > 0) yield "marginTop";
            while (i++ < 3) yield "marginRight";
            while (i-- > 0) yield "marginBottom";
        }
    }
    let margin = transformPos();
    for (var resKey in resources) {
        for (var resource of resources[resKey]) {
            resource.parent = resourceArea;

            let previousEl = resourceArea.div.children[resource.idCounter - 1];
            if (previousEl) {

                let marginnext = margin.next().value;
                switch (marginnext) {
                    case "marginLeft":
                        resource.div.style.marginLeft = previousEl.offsetLeft + 10 + "px";
                        break;
                    case "marginTop":
                        resource.div.style.marginTop = previousEl.offsetTop + 10 + "px";
                        resource.div.style.marginLeft = previousEl.offsetLeft + "px";
                        break;
                    case "marginRight":
                        resource.div.style.marginTop = previousEl.offsetTop + "px";
                        resource.div.style.marginLeft = previousEl.offsetLeft - 10 + "px";
                        break;
                    case "marginBottom":
                        resource.div.style.marginTop = previousEl.offsetTop - 10 + "px";
                        resource.div.style.marginLeft = previousEl.offsetLeft + "px";
                        break;
                }
            }
            resource.init();
        }
    }

    // controls
    var resdivs = document.getElementById("resource-area");
    let allocateRes = document.getElementById("allocate-resource");

    allocateRes.onclick = () => {
        resourceArea.allocateResources(resdivs.children);
    };

    let shufle = document.getElementById("shufle-resources");
    shufle.onclick = () => {
        resourceArea.shufle(resdivs);
    };

    return resourceArea;
}





import { draggingBuilding} from "../../gameobjects/building-component/building";
import BuildingRules from "../../../ruleEngine";
import MyHtmlElement from "../../htmlElement";
import { buildingTypes } from "../../../types";

let idCounter = 0;

export default class BuildingSlot extends MyHtmlElement {

    constructor(game, board, position, type) {
        super({
            id: type.name + "_slot" + idCounter++,
            className: "circle",
            div: document.createElement("div"),
            parent: board
        })

        this.type = type;
        this.game = game;
        this.position = position;
        this.game.state.removeBuilding(this);
    }

    add(child) {
        super.add(child,
            () => this.game.state.addBuilding(this));
    }
    
    init() {
        this.setPos(this.position.x, this.position.y)
        this.parent.add(this);

        this.initEventListener();
    }

    initEventListener() {
        this.event.ondragover.do(this.dragOver);
        this.event.ondragenter.do(this.dragEnter);
        this.event.ondragleave.do(this.dragLeave);
        this.event.ondrop.do(this.dragDrop);

        this.game.event.on("dragging").do(this.dragStart, this);
        this.game.event.on("draggingend").do(this.dragEnd, this);
    }

    dragStart() {
        if (!draggingBuilding || !draggingBuilding.type instanceof BuildingSlot) return;
        let buildingRules = new BuildingRules(this.game, this, draggingBuilding, false);
        if (this.isEmpty && draggingBuilding.type.slotType.isEqual(this.type)
            && buildingRules.allowed()) {
            this.addClass("empty");
        }
    }

    dragOver(e) {
        if (!draggingBuilding || !draggingBuilding.type instanceof BuildingSlot) return;
        e.preventDefault();
    }

    dragEnter(e) {
        if (!draggingBuilding || !draggingBuilding.type instanceof BuildingSlot) return;
        e.preventDefault();
        // draggingBuilding.addClass("hovered");
    }

    dragLeave() {
        if (!draggingBuilding || !draggingBuilding.type instanceof BuildingSlot) return;
        // this.changeClass(this.lastClassname)
    }

    dragDrop(e) {
        e.preventDefault();
        if (!draggingBuilding || !draggingBuilding.type instanceof BuildingSlot) return;

        let buildingRules = new BuildingRules(this.game, this, draggingBuilding);
        if (!buildingRules.allowed()) {
            console.log("not allowed: ", buildingRules.lastResult)
            return;
        }

        if (draggingBuilding.type.isEqual(buildingTypes.town)) {
            let lastBuilding = this.getChild();
            lastBuilding.owner.area.add(lastBuilding);
            lastBuilding.setUnplayed();
        }

        // reset highlighting and add
        this.changeClass(this.classNameDefault)
        this.add(draggingBuilding)

        // restyle dragged gameobject - delay needed setTimeout
        if (this.type.isLeftUpper || this.type.isRightUpper) {
            let classSuffix = this.type.isLeftUpper ? "left-upper" : "right-upper";
            setTimeout(() => draggingBuilding.addClass(this.type.name + "-" + classSuffix), 0)
        }

        setTimeout(() => draggingBuilding.setPlayed(), 0);
    }

    dragEnd() {
        if (!draggingBuilding || !draggingBuilding.type instanceof BuildingSlot) return;
        this.changeClass(this.classNameDefault);
    }
}
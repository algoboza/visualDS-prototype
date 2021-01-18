import { Element, Svg, SVG } from "@svgdotjs/svg.js";
import { Visualizable } from "../../structure/base";
import { Stack, StackExpose } from "../../structure/stack";

interface Cell {
    box: Element;
    height: number;
}

export class StackSVGRenderer {
    private stack: Stack;
    private stackExpose: StackExpose;
    private draw: Svg;

    private cells: Cell[];
    private yPointer: number;

    constructor(stack: Stack) {
        this.stack = stack;

        this.stack.addActionHandler("push", (e) => {
            this.onPush(e.value);
        });
        this.stack.addActionHandler("pop", () => {
            this.onPop();
        });
        this.stackExpose = stack.expose;

        this.cells = [];
        this.yPointer = 0;

        this.draw = SVG().viewbox(0, 0, 1000, 1000);

        this.init();
    }

    init(): void {}

    makeCell(data: Visualizable): Cell {
        const box = this.draw.group();

        const border = box.rect().fill("white").stroke("black");

        const textbox = box.text(data.toString()).font({ fill: "black" }).x(10).bbox();

        border.height(textbox.height + 10);
        border.width(100);

        return { box, height: textbox.height + 10 };
    }

    onPush(data: Visualizable): void {
        const cell = this.makeCell(data);

        const node = cell.box.move(0, this.yPointer);
        // this.draw.add(node);
        // this.draw.use(node);
        this.yPointer += cell.height + 5;

        this.cells.push(cell);
    }

    onPop(): void {
        if (this.stack.size() < 0) {
            throw new Error("Stack underflow error");
        }
        const cell = this.cells.pop();
        this.yPointer -= cell.height;
        cell.box.remove();
    }

    redraw(): void {
        console.log(this.cells);
    }

    get node(): SVGSVGElement {
        return this.draw.node;
    }
}

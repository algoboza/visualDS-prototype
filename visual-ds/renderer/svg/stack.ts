import { Svg, SVG, Text } from "@svgdotjs/svg.js";
import { Visualizable } from "../../structure/base";
import { Stack } from "../../structure/stack";

export class StackSVGRenderer {
    private stack: Stack;
    private svg: Svg;

    private nodes: Text[];

    constructor(stack: Stack) {
        this.stack = stack;

        this.stack.addActionHandler("push", (e) => {
            this.onPush(e.value);
        });
        this.stack.addActionHandler("pop", () => {
            this.onPop();
        });

        this.nodes = [];

        this.svg = SVG().size("100%", "100%");

        this.init();
    }

    init(): void {}

    onChange(): void {}

    onPush(data: Visualizable): void {
        const node = this.svg.text(data.toString()).move(0, this.stack.size() * 20);
        this.nodes.push(node);
    }

    onPop(): void {
        if (this.stack.size() < 0) {
            throw new Error("Stack underflow error");
        }
        const node = this.nodes.pop();
        node.remove();
    }

    get node(): SVGSVGElement {
        return this.svg.node;
    }
}

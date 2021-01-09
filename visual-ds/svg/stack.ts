import { Svg, SVG } from "@svgdotjs/svg.js";
import { Data } from "../base";
import { Stack } from "../stack";

export class StackSVGRenderer {
    private stack: Stack<Data>;
    private svg: Svg;

    constructor(stack: Stack<Data>) {
        this.stack = stack;

        this.stack.addChangeHandler(() => {
            this.onChange();
        });

        this.svg = SVG().size("100%", "100%");

        this.init();
    }

    init(): void {
        this.svg.rect(100, 100).stroke({ color: "black", width: 1 }).fill("white");
    }

    onChange(): void {}

    get node(): SVGSVGElement {
        return this.svg.node;
    }
}

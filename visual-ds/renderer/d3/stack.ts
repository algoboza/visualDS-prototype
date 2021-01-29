import { Visualizable } from "@/visual-ds/structure/base";
import { Stack } from "@/visual-ds/structure/stack";
import * as d3 from "d3";
import { makeProps } from "./utils/prop";

type Selection<T extends d3.BaseType = undefined, P extends d3.BaseType = null> = d3.Selection<
    T,
    undefined,
    P,
    undefined
>;
type GSelection = Selection<SVGGElement>;

interface StackD3RendererProps {
    cellSpace?: number;
    cellWidth?: number;
    cellHeight?: number;
    flyDistance?: number;
}

export class StackD3Renderer {
    private stack: Stack;

    private root: GSelection;
    private svg: Selection<SVGSVGElement>;

    private drawers: Drawer[];

    private handlers = {};

    props: StackD3RendererProps;

    constructor(stack: Stack, props?: StackD3RendererProps) {
        if (!stack || !(stack instanceof Stack)) {
            throw new Error(`${stack} is not a valid Stack`);
        }

        this.stack = stack;
        this.handlers["push"] = this.onPush.bind(this);
        this.handlers["pop"] = this.onPop.bind(this);
        this.stack.addActionHandler("push", this.handlers["push"]);
        this.stack.addActionHandler("pop", this.handlers["pop"]);

        this.props = makeProps(
            {
                cellSpace: 5,
                cellWidth: 40,
                cellHeight: 30,
                flyDistance: 40,
                ...props
            },
            () => {
                this.forceUpdate();
            }
        );

        this.svg = d3.create("svg").attr("viewBox", "0 0 800 200");

        this.init();
        this.update();
    }

    remove(): void {
        this.root.remove();
        this.root = null;

        this.stack.removeActionHandler("push", this.handlers["push"]);
        this.stack.removeActionHandler("pop", this.handlers["pop"]);
    }

    onPush(): void {
        this.update();
    }

    onPop(): void {
        this.update();
    }

    init(): void {
        this.root = this.svg.append("g").attr("transform", "translate(50, 0)");

        this.drawers = [BoxDrawer, TextDrawer, IndexDrawer, PointerDrawer, LabelDrawer].map(
            (D) => new D(this.root, this.props)
        );
    }

    update(): void {
        if (!this.alive) {
            return;
        }

        const stk = this.stack.expose.stack;

        this.drawers.forEach((d) => d.update(stk));
    }

    forceUpdate(): void {
        if (!this.alive) {
            return;
        }

        this.svg.select("*").remove();
        this.init();
        this.update();
    }

    node(): SVGSVGElement {
        return this.svg.node();
    }

    get alive(): boolean {
        return this.root !== null;
    }
}

abstract class Drawer {
    readonly group: GSelection;
    readonly props: StackD3RendererProps;

    constructor(parent: Selection<SVGElement>, props: StackD3RendererProps) {
        this.group = parent.append("g");
        this.props = props;
        this.init();
    }

    remove() {
        this.group.remove();
    }

    init(): void {}

    abstract update(data: Visualizable[]): void;
}

abstract class StaticDrawer extends Drawer {
    update() {}
}

function transition() {
    return d3.transition().duration(750).ease(d3.easeCubicOut);
}

const INDEX_HEIGHT = 30;

class BoxDrawer extends Drawer {
    update(stack: Visualizable[]) {
        const group = this.group;

        const { cellWidth, cellHeight, cellSpace, flyDistance } = this.props;

        group.attr("fill", "#660eb3");

        return group
            .selectAll("rect")
            .data(stack)
            .join(
                (enter) =>
                    enter
                        .append("rect")
                        .attr("x", (_, i: number) => (cellWidth + cellSpace) * i + flyDistance)
                        .attr("opacity", 0.0),
                (update) => update,
                (exit) =>
                    exit.call((exit) =>
                        exit
                            .transition(transition())
                            .attr("opacity", 0.0)
                            .attr("x", (_, i: number) => (cellWidth + cellSpace) * i + flyDistance)
                            .remove()
                    )
            )
            .call((group) =>
                group
                    .transition(transition())
                    .attr("x", (_, i: number) => (cellWidth + cellSpace) * i)
                    .attr("opacity", 1.0)
            )
            .attr("y", INDEX_HEIGHT)
            .attr("height", cellHeight)
            .attr("width", cellWidth);
    }
}

class TextDrawer extends Drawer {
    update(stack: Visualizable[]) {
        const group = this.group;

        const { cellWidth, cellHeight, cellSpace, flyDistance } = this.props;

        group.attr("fill", "white").attr("text-anchor", "middle");

        const flyX = (_: undefined, idx: number) =>
            (cellWidth + cellSpace) * idx + cellWidth / 2 + flyDistance;
        const normalX = (_: undefined, idx: number) =>
            (cellWidth + cellSpace) * idx + cellWidth / 2;

        return group
            .selectAll("text.val")
            .data(stack)
            .join(
                (enter) =>
                    enter
                        .append("text")
                        .attr("class", "val")
                        .attr("x", flyX)
                        .attr("fill-opacity", 0.0),
                (update) => update,
                (exit) =>
                    exit.call((exit) =>
                        exit
                            .transition(transition())
                            .attr("fill-opacity", 0.0)
                            .attr("x", flyX)
                            .remove()
                    )
            )
            .call((group) =>
                group.transition(transition()).attr("x", normalX).attr("fill-opacity", 1.0)
            )
            .text((d) => d.toString())
            .attr("y", INDEX_HEIGHT + cellHeight / 2)
            .attr("dy", "0.35em");
    }
}

class IndexDrawer extends Drawer {
    update(stack: Visualizable[]) {
        const group = this.group;

        const { cellWidth, cellSpace } = this.props;

        group.attr("text-anchor", "middle").attr("font-size", 13).attr("fill", "grey");

        return group
            .selectAll("text.idx")
            .data(stack)
            .join(
                (enter) =>
                    enter
                        .append("text")
                        .attr("class", "idx")
                        .attr("fill-opacity", 0.0)
                        .attr("y", INDEX_HEIGHT - 10 - 30),
                (update) => update,
                (exit) => exit.transition(transition()).attr("fill-opacity", 0.0).remove()
            )
            .text((_, i: number) => i)
            .attr("dy", "0.35em")
            .attr("x", (_, i: number) => (cellWidth + cellSpace) * i + cellWidth / 2)
            .call((group) =>
                group
                    .transition(transition())
                    .attr("fill-opacity", 1.0)
                    .attr("y", INDEX_HEIGHT - 10)
            );
    }
}

class LabelDrawer extends StaticDrawer {
    init() {
        const group = this.group;
        const { cellHeight } = this.props;

        group
            .append("text")
            .text("Index")
            .attr("font-size", 10)
            .attr("x", -10)
            .attr("y", INDEX_HEIGHT - 5)
            .attr("text-anchor", "end");

        group
            .append("text")
            .text("Data")
            .attr("font-size", 10)
            .attr("x", -10)
            .attr("y", INDEX_HEIGHT + cellHeight / 2 - 5)
            .attr("dy", "0.35em")
            .attr("text-anchor", "end");
    }
}

class PointerDrawer extends Drawer {
    update(stack: Visualizable[]) {
        const group = this.group;

        const { cellWidth, cellHeight, cellSpace } = this.props;

        group
            .selectAll("path.topptr")
            .data([stack.length])
            .join(
                (enter) =>
                    enter
                        .append("path")
                        .attr("class", "topptr")
                        .attr("d", "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z")
                        .attr("transform", `translate(${-cellSpace - 12}, ${cellHeight * 2})`),
                (update) =>
                    update
                        .call((update) =>
                            update
                                .transition(transition())
                                .attr(
                                    "transform",
                                    (d) =>
                                        `translate(${
                                            (cellWidth + cellSpace) * d - cellSpace - 12
                                        }, ${cellHeight * 2})`
                                )
                        )
                        .attr("fill-color", "red"),
                (exit) => exit
            );

        group
            .selectAll("text.topptr")
            .data([stack.length])
            .join(
                (enter) => enter.append("text").attr("class", "topptr").attr("x", -cellSpace),
                (update) =>
                    update.call((update) =>
                        update
                            .transition(transition())
                            .attr("x", (d) => (cellWidth + cellSpace) * d - cellSpace)
                    ),
                (exit) => exit
            )
            .text("TOP")
            .attr("text-anchor", "middle")
            .attr("dy", "0.75em")
            .attr("y", cellHeight * (2 + 2 / 3));
    }
}

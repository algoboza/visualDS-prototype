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

    props: StackD3RendererProps;

    constructor(stack: Stack, props?: StackD3RendererProps) {
        if (!stack || !(stack instanceof Stack)) {
            throw new Error(`${stack} is not a valid Stack`);
        }

        this.stack = stack;
        this.stack.addActionHandler("push", this.onPush.bind(this));
        this.stack.addActionHandler("pop", this.onPop.bind(this));

        this.props = makeProps(
            props,
            {
                cellSpace: 5,
                cellWidth: 40,
                cellHeight: 30,
                flyDistance: 40
            },
            () => {
                this.update();
            }
        );

        console.log(this.props);

        this.svg = d3.create("svg").attr("viewBox", "0 0 800 200");
        this.root = this.svg.append("g").attr("transform", "translate(50, 0)");

        this.drawers = [BoxDrawer, TextDrawer, IndexDrawer, PointerDrawer, LabelDrawer].map(
            (D) => new D(this.root, this.props)
        );

        this.update();
    }

    onPush(): void {
        this.update();
    }

    onPop(): void {
        this.update();
    }

    update(): void {
        const stk = this.stack.expose.stack;

        this.drawers.forEach((d) => d.update(stk));
    }

    node(): SVGSVGElement {
        return this.svg.node();
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

class BoxDrawer extends Drawer {
    update(stack: Visualizable[]) {
        const group = this.group;

        const { cellWidth, cellHeight, cellSpace, flyDistance } = this.props;

        const trans = d3.transition().duration(750).ease(d3.easeCubicOut);

        group.attr("fill", "#660eb3");

        return group
            .selectAll("rect")
            .data(stack)
            .join(
                (enter) =>
                    enter
                        .append("rect")
                        .attr("x", (_, i: number) => (cellWidth + cellSpace) * i + flyDistance)
                        .attr("opacity", 0.0)
                        .call((enter) =>
                            enter
                                .transition(trans)
                                .attr("x", (_, i: number) => (cellWidth + cellSpace) * i)
                                .attr("opacity", 1.0)
                        ),
                (update) => update,
                (exit) =>
                    exit.call((exit) =>
                        exit
                            .transition(trans)
                            .attr("opacity", 0.0)
                            .attr("x", (_, i: number) => (cellWidth + cellSpace) * i + flyDistance)
                            .remove()
                    )
            )

            .attr("y", 30)
            .attr("height", cellHeight)
            .attr("width", cellWidth);
    }
}

class TextDrawer extends Drawer {
    update(stack: Visualizable[]) {
        const group = this.group;

        const { cellWidth, cellHeight, cellSpace, flyDistance } = this.props;

        const trans = d3.transition().duration(750).ease(d3.easeCubicOut);

        group.attr("fill", "white").attr("text-anchor", "middle");

        return group
            .selectAll("text.val")
            .data(stack)
            .join(
                (enter) =>
                    enter
                        .append("text")
                        .attr("class", "val")
                        .attr(
                            "x",
                            (_, i: number) =>
                                (cellWidth + cellSpace) * i + cellWidth / 2 + flyDistance
                        )
                        .attr("fill-opacity", 0.0)
                        .call((enter) =>
                            enter
                                .transition(trans)
                                .attr("x", (_, i: number) => (cellWidth + cellSpace) * i + 20)
                                .attr("fill-opacity", 1.0)
                        ),
                (update) => update,
                (exit) =>
                    exit.call((exit) =>
                        exit
                            .transition(trans)
                            .attr("fill-opacity", 0.0)
                            .attr(
                                "x",
                                (_, i: number) => (cellWidth + cellSpace) * i + cellWidth / 2 + 40
                            )
                            .remove()
                    )
            )
            .text((d) => d.toString())
            .attr("y", cellHeight + cellHeight / 2)
            .attr("dy", "0.35em");
    }
}

class IndexDrawer extends Drawer {
    update(stack: Visualizable[]) {
        const group = this.group;

        const { cellWidth, cellHeight, cellSpace } = this.props;

        const trans = d3.transition().duration(750).ease(d3.easeCubicOut);

        group.attr("text-anchor", "middle").attr("font-size", 13).attr("fill", "grey");

        return group
            .selectAll("text.idx")
            .data(stack)
            .join(
                (enter) =>
                    enter
                        .append("text")
                        .attr("class", "idx")
                        .attr("x", (_, i: number) => (cellWidth + cellSpace) * i + 20)
                        .attr("fill-opacity", 0.0)
                        .attr("y", cellHeight - 10 - 30)
                        .call((enter) =>
                            enter
                                .transition(trans)
                                .attr("fill-opacity", 1.0)
                                .attr("y", cellHeight - 10)
                        ),
                (update) => update,
                (exit) => exit.transition(trans).attr("fill-opacity", 0.0).remove()
            )
            .text((_, i: number) => i)
            .attr("dy", "0.35em");
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
            .attr("y", cellHeight - 5)
            .attr("text-anchor", "end");

        group
            .append("text")
            .text("Data")
            .attr("font-size", 10)
            .attr("x", -10)
            .attr("y", cellHeight * 2 - 5)
            .attr("text-anchor", "end");
    }
}

class PointerDrawer extends Drawer {
    update(stack: Visualizable[]) {
        const group = this.group;

        const { cellWidth, cellHeight, cellSpace } = this.props;

        const trans = d3.transition().duration(750).ease(d3.easeCubicOut);

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
                                .transition(trans)
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
                            .transition(trans)
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

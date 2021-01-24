import { Visualizable } from "@/visual-ds/structure/base";
import { Stack } from "@/visual-ds/structure/stack";
import * as d3 from "d3";

type Selection<T extends d3.BaseType = undefined, P extends d3.BaseType = null> = d3.Selection<
    T,
    undefined,
    P,
    undefined
>;
type GSelection = Selection<SVGGElement>;

const CELL_SPACE = 5;
const CELL_WIDTH = 40;
const CELL_HEIGHT = 30;
const FLY_DISTANCE = 40;

export class StackD3Renderer {
    private stack: Stack;
    private svg: Selection<SVGSVGElement>;
    private boxGroup: GSelection;
    private textGroup: GSelection;

    constructor(stack: Stack) {
        this.stack = stack;
        this.stack.addActionHandler("push", this.onPush.bind(this));
        this.stack.addActionHandler("pop", this.onPop.bind(this));

        this.svg = d3.create("svg").attr("viewBox", "0 0 800 800");
        this.boxGroup = this.svg.append("g").attr("class", "box");
        this.textGroup = this.svg
            .append("g")
            .attr("class", "text")
            .attr("fill", "black")
            .attr("text-anchor", "middle");

        this.svg.append("g").attr("class", "index").attr("text-anchor", "middle");

        this.update();
    }

    onPush(): void {
        this.update();
    }

    onPop(): void {
        this.update();
    }

    update(): void {
        drawBox(this.boxGroup, this.stack.expose.stack);
        drawText(this.textGroup, this.stack.expose.stack);
        drawIndex(this.svg.select("g.index"), this.stack.expose.stack);
    }

    node(): SVGSVGElement {
        return this.svg.node();
    }
}

function drawBox(group: GSelection, stack: Visualizable[]) {
    const trans = d3.transition().duration(750).ease(d3.easeCubicOut);

    return group
        .selectAll("rect")
        .data(stack)
        .join(
            (enter) =>
                enter
                    .append("rect")
                    .attr("x", (_, i: number) => (CELL_WIDTH + CELL_SPACE) * i + FLY_DISTANCE)
                    .attr("opacity", 0.0)
                    .call((enter) =>
                        enter
                            .transition(trans)
                            .attr("x", (_, i: number) => (CELL_WIDTH + CELL_SPACE) * i)
                            .attr("opacity", 1.0)
                    ),
            (update) => update,
            (exit) =>
                exit.call((exit) =>
                    exit
                        .transition(trans)
                        .attr("opacity", 0.0)
                        .attr("x", (_, i: number) => (CELL_WIDTH + CELL_SPACE) * i + FLY_DISTANCE)
                        .remove()
                )
        )

        .attr("y", 30)
        .attr("height", CELL_HEIGHT)
        .attr("width", CELL_WIDTH)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 2);
}

function drawText(group: GSelection, stack: Visualizable[]) {
    const trans = d3.transition().duration(750).ease(d3.easeCubicOut);

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
                            (CELL_WIDTH + CELL_SPACE) * i + CELL_WIDTH / 2 + FLY_DISTANCE
                    )
                    .attr("fill-opacity", 0.0)
                    .call((enter) =>
                        enter
                            .transition(trans)
                            .attr("x", (_, i: number) => (CELL_WIDTH + CELL_SPACE) * i + 20)
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
                            (_, i: number) => (CELL_WIDTH + CELL_SPACE) * i + CELL_WIDTH / 2 + 40
                        )
                        .remove()
                )
        )
        .text((d) => d.toString())
        .attr("y", CELL_HEIGHT + CELL_HEIGHT / 2)
        .attr("dy", "0.35em");
}

function drawIndex(group: GSelection, stack: Visualizable[]) {
    const trans = d3.transition().duration(750).ease(d3.easeCubicOut);

    return group
        .selectAll("text.idx")
        .data(stack)
        .join(
            (enter) =>
                enter
                    .append("text")
                    .attr("class", "idx")
                    .attr("x", (_, i: number) => (CELL_WIDTH + CELL_SPACE) * i + 20)
                    .attr("fill-opacity", 0.0)
                    .attr("y", CELL_HEIGHT - 10 - 30)
                    .call((enter) =>
                        enter
                            .transition(trans)
                            .attr("fill-opacity", 1.0)
                            .attr("y", CELL_HEIGHT - 10)
                    ),
            (update) => update,
            (exit) => exit.transition(trans).attr("fill-opacity", 0.0).remove()
        )
        .text((_, i: number) => i)
        .attr("dy", "0.35em");
}

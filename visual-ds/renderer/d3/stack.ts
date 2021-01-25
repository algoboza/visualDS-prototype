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
    private root: GSelection;
    private svg: Selection<SVGSVGElement>;
    private boxGroup: GSelection;
    private textGroup: GSelection;
    private labelGroup: GSelection;

    constructor(stack: Stack) {
        this.stack = stack;
        this.stack.addActionHandler("push", this.onPush.bind(this));
        this.stack.addActionHandler("pop", this.onPop.bind(this));

        this.svg = d3.create("svg").attr("viewBox", "0 0 800 200");

        this.root = this.svg.append("g").attr("transform", "translate(50, 0)");

        this.boxGroup = this.root.append("g").attr("class", "box");
        this.textGroup = this.root.append("g").attr("class", "text");
        this.labelGroup = this.root.append("g");

        drawLabel(this.root.append("g"));

        this.root.append("g").attr("class", "index");

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

        drawBox(this.boxGroup, stk);
        drawText(this.textGroup, stk);
        drawIndex(this.root.select("g.index"), stk);
        drawPointer(this.labelGroup, stk);
    }

    node(): SVGSVGElement {
        return this.svg.node();
    }
}

function drawBox(group: GSelection, stack: Visualizable[]) {
    const trans = d3.transition().duration(750).ease(d3.easeCubicOut);

    group.attr("fill", "#660eb3");

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
        .attr("width", CELL_WIDTH);
}

function drawText(group: GSelection, stack: Visualizable[]) {
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

    group.attr("text-anchor", "middle").attr("font-size", 13).attr("fill", "grey");

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

function drawLabel(group: GSelection) {
    group
        .append("text")
        .text("Index")
        .attr("font-size", 10)
        .attr("x", -10)
        .attr("y", CELL_HEIGHT - 5)
        .attr("text-anchor", "end");

    group
        .append("text")
        .text("Data")
        .attr("font-size", 10)
        .attr("x", -10)
        .attr("y", CELL_HEIGHT * 2 - 5)
        .attr("text-anchor", "end");
}

function drawPointer(group: GSelection, stack: Visualizable[]) {
    const trans = d3.transition().duration(750).ease(d3.easeCubicOut);

    // group.html(
    //     `<path fill="currentColor" d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />`
    // );

    group
        .selectAll("path.topptr")
        .data([stack.length])
        .join(
            (enter) =>
                enter
                    .append("path")
                    .attr("class", "topptr")
                    .attr("d", "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z")
                    .attr("transform", `translate(${-CELL_SPACE - 12}, ${CELL_HEIGHT * 2})`),
            (update) =>
                update
                    .call((update) =>
                        update
                            .transition(trans)
                            .attr(
                                "transform",
                                (d) =>
                                    `translate(${
                                        (CELL_WIDTH + CELL_SPACE) * d - CELL_SPACE - 12
                                    }, ${CELL_HEIGHT * 2})`
                            )
                    )
                    .attr("fill-color", "red"),
            (exit) => exit
        );

    group
        .selectAll("text.topptr")
        .data([stack.length])
        .join(
            (enter) => enter.append("text").attr("class", "topptr").attr("x", -CELL_SPACE),
            (update) =>
                update.call((update) =>
                    update
                        .transition(trans)
                        .attr("x", (d) => (CELL_WIDTH + CELL_SPACE) * d - CELL_SPACE)
                ),
            (exit) => exit
        )
        .text("TOP")
        .attr("text-anchor", "middle")
        .attr("dy", "0.75em")
        .attr("y", CELL_HEIGHT * (2 + 2 / 3));
}

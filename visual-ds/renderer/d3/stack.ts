import { Stack } from "@/visual-ds/structure/stack";
import * as d3 from "d3";

const CELL_SPACE = 5;
const CELL_WIDTH = 40;
const CELL_HEIGHT = 30;
const FLY_DISTANCE = 40;

export class StackD3Renderer {
    private stack: Stack;
    private svg: d3.Selection<SVGSVGElement, undefined, null, undefined>;
    private boxGroup: d3.Selection<SVGGElement, undefined, SVGSVGElement, undefined>;
    private textGroup: d3.Selection<SVGGElement, undefined, SVGSVGElement, undefined>;

    constructor(stack: Stack) {
        this.stack = stack;
        this.stack.addActionHandler("push", this.onPush.bind(this));
        this.stack.addActionHandler("pop", this.onPop.bind(this));

        this.svg = d3.create("svg").attr("viewBox", "0 0 500 500");
        this.boxGroup = this.svg.append("g");
        this.textGroup = this.svg.append("g").attr("fill", "black").attr("text-anchor", "middle");

        this.update();
    }

    onPush(): void {
        this.update();
    }

    onPop(): void {
        this.update();
    }

    update(): void {
        const trans = d3.transition().duration(750).ease(d3.easeCubicOut);

        this.boxGroup
            .selectAll("rect")
            .data(this.stack.expose.stack)
            .join(
                (enter) =>
                    enter
                        .append("rect")
                        .attr("x", (_, i: number) => (CELL_WIDTH + CELL_SPACE) * i + FLY_DISTANCE)
                        .attr("opacity", 0.0)
                        .call((enter) =>
                            enter
                                .transition(trans)
                                .duration(750)
                                .attr("x", (_, i: number) => (CELL_WIDTH + CELL_SPACE) * i)
                                .attr("opacity", 1.0)
                        ),
                (update) => update,
                (exit) =>
                    exit.call((exit) =>
                        exit
                            .transition(trans)
                            .attr("opacity", 0.0)
                            .attr(
                                "x",
                                (_, i: number) => (CELL_WIDTH + CELL_SPACE) * i + FLY_DISTANCE
                            )
                            .remove()
                    )
            )

            .attr("y", 30)
            .attr("height", CELL_HEIGHT)
            .attr("width", CELL_WIDTH)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        this.textGroup
            .selectAll("text")
            .data(this.stack.expose.stack)
            .join(
                (enter) =>
                    enter
                        .append("text")
                        .attr(
                            "x",
                            (_, i: number) =>
                                (CELL_WIDTH + CELL_SPACE) * i + CELL_WIDTH / 2 + FLY_DISTANCE
                        )
                        .attr("fill-opacity", 0.0)
                        .call((enter) =>
                            enter
                                .transition(trans)
                                .duration(750)
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
                                (_, i: number) =>
                                    (CELL_WIDTH + CELL_SPACE) * i + CELL_WIDTH / 2 + 40
                            )
                            .remove()
                    )
            )
            .text((d) => d.toString())
            .attr("y", CELL_HEIGHT + CELL_HEIGHT / 2)
            .attr("dy", "0.35em");
    }

    node(): SVGSVGElement {
        return this.svg.node();
    }
}

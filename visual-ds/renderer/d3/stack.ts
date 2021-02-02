import { DSObserver, getExpose } from "@/visual-ds/structure/base";
import { Stack } from "@/visual-ds/structure/stack";
import * as d3 from "d3";
import { D3Renderer, GSelection, Selection } from "./general";
import { makeProps } from "./utils/prop";
import { translate } from "./utils/svg";

export interface StackD3RendererProps {
    cellSpace?: number;
    cellWidth?: number;
    cellHeight?: number;
    flyDistance?: number;
    showLabel?: boolean;
    showIndex?: boolean;
}

export const defaultStackD3RendererProps = Object.freeze({
    cellSpace: 5,
    cellWidth: 40,
    cellHeight: 30,
    flyDistance: 40,
    showIndex: true,
    showLabel: true
});

export class StackD3Renderer implements D3Renderer {
    private stack: Stack<string>;
    private drawers: Drawer[];
    private observer: DSObserver;
    private _props: StackD3RendererProps;
    private root: GSelection;

    constructor(stack: Stack, props?: StackD3RendererProps) {
        if (!stack || !(stack instanceof Stack)) {
            throw new Error(`${stack} is not a valid Stack`);
        }

        this.stack = stack;
        this.observer = this.update.bind(this);
        this.stack.subscribe(this.observer);

        this.root = d3.create("svg:g");

        // prop 들을 등록하고 prop 변경시의 동작을 지정
        this.props = props ?? {};

        // this.init();
        // this.update();
    }

    get props(): StackD3RendererProps {
        return this._props;
    }

    set props(obj: StackD3RendererProps) {
        this._props = makeProps(
            {
                ...defaultStackD3RendererProps,
                ...obj
            },
            () => {
                this.forceUpdate();
            }
        );
        this.forceUpdate();
    }

    remove(): void {
        this.root.remove();
        this.root = null;

        this.stack.unsubscribe(this.observer);
    }

    onPush(): void {
        this.update();
    }

    onPop(): void {
        this.update();
    }

    init(): void {
        // Drawer들 한번에 호출
        this.drawers = [BoxDrawer, TextDrawer, IndexDrawer, PointerDrawer, LabelDrawer].map(
            (D) => new D(this.root, this.props)
        );
    }

    update(): void {
        if (!this.alive) {
            return;
        }

        const stk = getExpose(this.stack).stack;

        this.drawers.forEach((d) => d.update(stk));
    }

    forceUpdate(): void {
        if (!this.alive) {
            return;
        }

        this.root.selectAll("*").remove();
        this.init();
        this.update();
    }

    node(): GSelection {
        return this.root;
    }

    get alive(): boolean {
        return this.root !== null;
    }
}

/**
 * 화면에 그리는 정보들 중 같은 유형의 것들은 하나의 Drawer에서 맡아서 담당한다.
 * Drawer는 하나의 group(SVG g 태그)을 가지고 그 안에 모든 것을 그린다.
 */
abstract class Drawer {
    readonly group: GSelection;
    readonly props: StackD3RendererProps;

    constructor(parent: Selection<SVGElement>, props: StackD3RendererProps) {
        this.group = parent.append("g");
        this.props = props;
    }

    remove() {
        this.group.remove();
    }

    // 데이터 변경시에 그리기
    abstract update(data: unknown[]): void;
}

/**
 * Update 동작이 없는 Drawer
 */
abstract class StaticDrawer extends Drawer {
    update() {}
}

function transition(selection: Selection) {
    return selection.transition().duration(750).ease(d3.easeCubicOut);
}

const INDEX_HEIGHT = 30;
const LABEL_WIDTH = 50;
const LABEL_BOX_SPACE = 5;

function getBoxStartY(props: StackD3RendererProps) {
    const { showIndex } = props;
    if (showIndex) {
        return INDEX_HEIGHT;
    } else {
        return 0;
    }
}

function getBoxStartX(props: StackD3RendererProps) {
    const { showLabel } = props;

    if (showLabel) {
        return LABEL_WIDTH;
    } else {
        return 0;
    }
}

function getCellX(props: StackD3RendererProps, index: number) {
    const { cellWidth, cellSpace } = props;

    return getBoxStartX(props) + (cellWidth + cellSpace) * index;
}

function getBoxEndY(props: StackD3RendererProps) {
    const { cellHeight } = props;

    return getBoxStartY(props) + cellHeight;
}

function getTopX(props: StackD3RendererProps, len: number) {
    if (len === 0) {
        return getCellX(props, 0);
    }
    return getCellX(props, len) - props.cellSpace;
}

// 데이터 표시하는 상자의 Drawer
class BoxDrawer extends Drawer {
    update(stack: unknown[]) {
        const group = this.group;

        const { cellWidth, cellHeight, flyDistance } = this.props;

        group.attr("fill", "#660eb3");

        group
            .selectAll("rect")
            .data(stack)
            .join(
                (enter) =>
                    enter
                        .append("rect")
                        .attr("x", (_, i: number) => getCellX(this.props, i) + flyDistance)
                        .attr("opacity", 0.0),
                (update) => update,
                (exit) =>
                    exit.call((exit) =>
                        transition(exit)
                            .attr("opacity", 0.0)
                            .attr("x", (_, i: number) => getCellX(this.props, i) + flyDistance)
                            .remove()
                    )
            )
            .call((group) =>
                transition(group)
                    .attr("x", (_, i: number) => getCellX(this.props, i))
                    .attr("opacity", 1.0)
            )
            .attr("y", getBoxStartY(this.props))
            .attr("height", cellHeight)
            .attr("width", cellWidth);
    }
}

// 데이터의 문자를 그리는 Drawer
class TextDrawer extends Drawer {
    update(stack: unknown[]) {
        const group = this.group;

        const { cellWidth, cellHeight, flyDistance } = this.props;

        group.attr("fill", "white").attr("text-anchor", "middle");

        const flyX = (_: undefined, idx: number) =>
            getCellX(this.props, idx) + cellWidth / 2 + flyDistance;
        const normalX = (_: undefined, idx: number) => getCellX(this.props, idx) + cellWidth / 2;

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
                        transition(exit).attr("fill-opacity", 0.0).attr("x", flyX).remove()
                    )
            )
            .call((group) => transition(group).attr("x", normalX).attr("fill-opacity", 1.0))
            .text((d) => d.toString())
            .attr("y", getBoxStartY(this.props) + cellHeight / 2)
            .attr("dy", "0.35em");
    }
}

// 상단 인덱스 표시를 그리는 Drawer
class IndexDrawer extends Drawer {
    update(stack: unknown[]) {
        const group = this.group;

        const { cellWidth, showIndex } = this.props;

        if (!showIndex) {
            return;
        }

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
                (exit) => transition(exit).attr("fill-opacity", 0.0).remove()
            )
            .text((_, i: number) => i)
            .attr("dy", "0.35em")
            .attr("x", (_, i: number) => getCellX(this.props, i) + cellWidth / 2)
            .call((group) =>
                transition(group)
                    .attr("fill-opacity", 1.0)
                    .attr("y", INDEX_HEIGHT - 10)
            );
    }
}

// 좌측의 범례를 표시하는 Drawer
class LabelDrawer extends StaticDrawer {
    constructor(selection, root) {
        super(selection, root);

        const group = this.group;
        const { cellHeight, showIndex, showLabel } = this.props;

        if (!showLabel) {
            return;
        }

        if (showIndex) {
            group
                .append("text")
                .text("Index")
                .attr("font-size", 10)
                .attr("x", getBoxStartX(this.props) - LABEL_BOX_SPACE)
                .attr("y", getBoxStartY(this.props) - 5)
                .attr("text-anchor", "end");
        }

        group
            .append("text")
            .text("Data")
            .attr("font-size", 10)
            .attr("x", getBoxStartX(this.props) - LABEL_BOX_SPACE)
            .attr("y", getBoxStartY(this.props) + cellHeight / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "end");
    }
}

// 현재 Top 을 표시하는 Drawer
class PointerDrawer extends Drawer {
    topptr: Selection<SVGPathElement>;
    toptext: Selection<SVGTextElement>;
    haha: number;

    constructor(selection, props) {
        super(selection, props);

        this.topptr = this.group
            .append("path")
            .attr("d", "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z")
            .attr("transform", translate(getTopX(this.props, 0) - 12, getBoxEndY(this.props)));

        this.toptext = this.group
            .append("text")
            .attr("x", getTopX(this.props, 0))
            .text("TOP")
            .attr("text-anchor", "middle")
            .attr("dy", "0.75em")
            .attr("y", getBoxEndY(this.props) + 20);
    }

    update(stack: unknown[]) {
        const len = stack.length;

        transition(this.topptr).attr(
            "transform",
            translate(getTopX(this.props, len) - 12, getBoxEndY(this.props))
        );

        transition(this.toptext).attr("x", getTopX(this.props, len));
    }
}

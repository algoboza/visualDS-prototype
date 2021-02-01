import { DSObserver, getExpose } from "@/visual-ds/structure/base";
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

/**
 * Stack 을 rendering 할 때 갖춰주어야할 props
 */
interface StackD3RendererProps {
    cellSpace?: number;
    cellWidth?: number;
    cellHeight?: number;
    flyDistance?: number;
}

export class StackD3Renderer {
    // 스택 
    private stack: Stack<string>; 

    // svg root tag?
    /** root 또한 동일
    svg: Selection
        _groups: [Array(1)]
        _parents: [null]
        __proto__: Object
    */
    private root: GSelection; 
    private svg: Selection<SVGSVGElement>; 

    // Drawer abstract
    private drawers: Drawer[]; 

    // type:string 의 값이 있어야함.
    private observer: DSObserver; 

    props: StackD3RendererProps;

    constructor(stack: Stack, props?: StackD3RendererProps) {
        if (!stack || !(stack instanceof Stack)) {
            throw new Error(`${stack} is not a valid Stack`);
        }

        this.stack = stack;

        // update 함수에 this binding 한 결과 전달
        // this만 바인딩한 update 함수 전달.
        // (args:TArgs): void; => TArgs 는 null도 되는것?
        this.observer = this.update.bind(this);  

        //  [ObserverKey]: DSObserver<TNotify>[]; 배열에 옵저버넣기
        this.stack.subscribe(this.observer);

        // prop 들을 등록하고 prop 변경시의 동작을 지정
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

        // 맨 위 svg 만들기.
        this.svg = d3.create("svg").attr("viewBox", "0 0 800 200");

        this.init();
        this.update();
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
        // root 의 역할으 맨 위의 g 태그를 가리키는 것.
        this.root = this.svg.append("g").attr("transform", "translate(50, 0)");

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
        this.init();
    }

    remove() {
        this.group.remove();
    }

    // 초기 실행시에 그리기
    // 범례 그리는데에 사용됨.
    init(): void {}

    // 데이터 변경시에 그리기
    abstract update(data: unknown[]): void;
}

/**
 * Update 동작이 없는 Drawer
 */
abstract class StaticDrawer extends Drawer {
    update() {}
}

function transition() {
    return d3.transition().duration(750).ease(d3.easeCubicOut);
}

const INDEX_HEIGHT = 30;

// 데이터 표시하는 상자의 Drawer
class BoxDrawer extends Drawer {
    update(stack: unknown[]) {
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
            .attr("width", cellWidth)
            // 21.01.31. test branch tested.
            .on("click",function(){alert('box!');}); 
    }
}

// 데이터의 문자를 그리는 Drawer
class TextDrawer extends Drawer {
    update(stack: unknown[]) {
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

// 상단 인덱스 표시를 그리는 Drawer
class IndexDrawer extends Drawer {
    update(stack: unknown[]) {
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

// 좌측의 범례를 표시하는 Drawer
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

// 현재 Top 을 표시하는 Drawer
class PointerDrawer extends Drawer {
    update(stack: unknown[]) {
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

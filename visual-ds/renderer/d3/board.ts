import * as d3 from "d3";
import { GSelection, Selection, D3Renderer } from "./general";

import type { ZoomBehavior } from "d3";

/**
 * 여러개의 Renderer들을 모아주는 Board
 * 확대, 축소, 크기조절을 담당한다
 */
export class D3Board {
    svg: Selection<SVGSVGElement>;
    root: GSelection;
    children: D3BoardItem[];

    private zoom: ZoomBehavior<Element, unknown>;

    constructor() {
        this.children = [];

        this.svg = d3.create("svg");
        this.root = this.svg.append("g");

        this.zoom = d3.zoom().on("zoom", ({ transform }) => {
            this.root.attr("transform", transform);
        });

        this.svg.call(this.zoom);
    }

    /**
     * 자료구조를 화면에 추가
     * @param renderer 추가할 자료구조 Renderer
     */
    add(renderer: D3Renderer): void {
        const item = new D3BoardItem(renderer);
        this.children.push(item);

        this.root.append(() => renderer.node());
    }

    remove(renderer: D3Renderer): void {
        const idx = this.children.findIndex((c) => renderer === c.renderer);
        if (idx !== -1) {
            this.children.splice(idx, 1);
        }
    }

    /**
     * Board 자원 모두 해제
     */
    dispose(): void {
        this.children.forEach((r) => r.dispose());
        this.zoom.on("zoom", null);
        this.svg.remove();
    }

    /**
     * SVG의 DOM객체를 가져온다.
     */
    node(): SVGSVGElement {
        return this.svg.node();
    }
}

class D3BoardItem {
    readonly renderer: D3Renderer;

    private readonly root: GSelection;

    constructor(renderer: D3Renderer) {
        this.root = d3.create("svg:g");

        this.renderer = renderer;
        this.root.append(() => renderer.node());
    }

    dispose(): void {
        this.renderer.dispose();
        this.root.remove();
    }

    g() {
        return this.root;
    }
}

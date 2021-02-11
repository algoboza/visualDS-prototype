import * as d3 from "d3";
import type { BaseType } from "d3";

// P 제네릭은 부모노드를 위해 설정
export type Selection<
    T extends d3.BaseType = BaseType,
    P extends d3.BaseType = BaseType
> = d3.Selection<T, unknown, P, unknown>;

export type GSelection = Selection<SVGGElement>;

export interface D3Renderer {
    node(): Element;
    dispose(): void;
    props: object;
}

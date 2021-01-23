import * as d3 from "d3";

export class D3Board {
    selection: d3.Selection<SVGSVGElement, undefined, null, undefined>;

    constructor() {
        this.selection = d3.create("svg");
    }

    append() {}

    node(): SVGSVGElement {
        return this.selection.node();
    }
}

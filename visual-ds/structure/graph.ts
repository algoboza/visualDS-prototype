import { DSBase } from "./base";

interface StackExpose<T> {
    nodes: Node<T>[];
}

interface Edge {
    to: number;
    weight: number;
}

interface Node<T> {
    data: T;
    outgoing: Edge[];
}

export class Graph<T = unknown> extends DSBase<StackExpose<T>, {}> {
    private nodes: Node<T>[];

    constructor() {
        super();

        this.clear();
        this.makeExpose(() => ({
            nodes: this.nodes
        }));
    }

    addNode(data: T): number {
        const node: Node<T> = {
            data: data,
            outgoing: []
        };

        let idx = 0;
        while (idx < this.nodes.length && this.nodes[idx] !== null) {
            idx++;
        }

        this.nodes[idx] = node;

        this.notifyChange({});

        return idx;
    }

    removeNode(index: number): void {
        const node = this.nodes[index];

        if (node) {
            for (let there = 0; there < this.nodes.length; there++) {
                if (there === index) {
                    continue;
                }

                const newEdges = [];
                for (const edge of this.nodes[there].outgoing) {
                    if (edge.to !== index) {
                        newEdges.push(edge);
                    }
                }

                this.nodes[there].outgoing = newEdges;
            }
        }

        this.nodes[index] = null;

        this.notifyChange({});
    }

    addEdge(from: number, to: number, weight: number): boolean {
        if (!this.nodes[from] || !this.nodes[to]) {
            return false;
        }

        this.nodes[from].outgoing.push({
            to: to,
            weight: weight
        });

        this.notifyChange({});

        return true;
    }

    removeEdge(from: number, to: number): boolean {
        if (!this.isValidNode(from) || !this.isValidNode(to)) {
            return false;
        }
    }

    getEdges(index: number): Edge[] {
        if (!this.isValidNode(index)) {
            return [];
        }
        return [...this.nodes[index].outgoing];
    }

    isValidNode(index: number): boolean {
        return !!this.nodes[index];
    }

    clear(): void {
        this.nodes = [];
    }
}

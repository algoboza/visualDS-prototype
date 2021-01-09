import { Notifyable } from "./base";

export interface Data {
    type: "string" | "number";
}

export class Stack<T> extends Notifyable {
    private stk: T[];

    constructor() {
        super();
        this.stk = [];
    }

    push(value: T): void {
        this.stk.push(value);
        this.notifyChange();
    }

    pop(): T {
        const ret = this.stk.pop();
        this.notifyChange();
        return ret;
    }

    size(): number {
        return this.stk.length;
    }
}

class StackController {
    constructor() {}
}

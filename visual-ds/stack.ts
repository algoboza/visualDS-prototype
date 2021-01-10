import { Observable } from "./base";

export interface Data {
    type: "string" | "number";
    value: unknown;
}

export class Stack<T> extends Observable {
    private stk: T[];

    constructor() {
        super();
        this.stk = [];
    }

    push(value: T): void {
        this.stk.push(value);
        this.notifyChange("push", { action: "push", value });
    }

    pop(): T {
        const value = this.stk.pop();
        this.notifyChange("pop", { action: "pop", value });
        return value;
    }

    size(): number {
        return this.stk.length;
    }
}

class StackController {
    constructor() {}
}

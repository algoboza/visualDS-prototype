import { DSBase, Visualizable, DSObservable } from "./base";

export class Array<T extends Visualizable = Visualizable> extends DSObservable implements DSBase {
    public readonly name = "Array";

    private arr: T[];

    constructor() {
        super();
        this.arr = [];
    }

    push(value: T): void {
        this.arr.push(value);
        this.notifyChange("push", { value });
    }

    pop(idx: number): T {
        if (idx === undefined) {
            idx = this.size() - 1;
        }
        const value = this.arr.splice(idx, 1)[0];
        this.notifyChange("pop", { value });
        return value;
    }

    get(idx: number): T {
        return this.arr[idx];
    }

    set(idx: number, value: T): void {
        this.arr[idx] = value;
    }

    size(): number {
        return this.arr.length;
    }
}

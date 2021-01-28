import { DSBase, Visualizable, DSObservable } from "./base";

export interface StackExpose<T extends Visualizable = Visualizable> {
    stack: T[];
}

export class Stack<T extends Visualizable = Visualizable>
    extends DSObservable<StackExpose<T>>
    implements DSBase {
    public readonly name = "Stack";

    private stk: T[];

    constructor() {
        super();
        this.stk = [];

        this.onExpose(() => ({
            stack: [...this.stk] 
        }));
        // 형태 : 객체
        // 자료형 : T[]
        // this.stk 값을 산개시켜줌.
        // #exposeFn 함수가 된다.
    }

    push(value: T): void {
        this.stk.push(value);
        this.notifyChange("push", { value });
    }

    pop(): T {
        const value = this.stk.pop();
        this.notifyChange("pop", { value });
        return value;
    }

    size(): number {
        return this.stk.length;
    }
}

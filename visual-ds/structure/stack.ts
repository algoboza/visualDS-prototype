import { DSBase, Visualizable, DSObservable } from "./base";

export interface StackExpose<T extends Visualizable = Visualizable> {
    stack: T[];
}
// T extends Visualizable=Visualizable equals to TExpose type.

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

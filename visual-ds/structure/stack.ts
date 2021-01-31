import { DSBase } from "./base";

<<<<<<< HEAD
export interface StackExpose<T extends Visualizable = Visualizable> {
    // T 는 Visualizable 을 상속한 객체만 가능.
    // default : Visualizable
    stack: T[];
}


export class Stack<T extends Visualizable = Visualizable>
    extends DSObservable<StackExpose<T>>
    implements DSBase {
        public readonly name = "Stack";
=======
/**
 * Expose 시킬 내부 정보
 */
export interface StackExpose<T> {
    stack: T[];
}

interface PushArgs<T> {
    type: "push";
    value: T;
}

interface PopArgs<T> {
    type: "pop";
    value: T;
}

/**
 * 변경을 통지 할 때의 파라미터
 */
type ChangeArgs<T> = PushArgs<T> | PopArgs<T>;

export class Stack<T = unknown> extends DSBase<StackExpose<T>, ChangeArgs<T>> {
    public readonly name = "Stack";
>>>>>>> 9e2d2ee1a4969b6aba6c9f40f29dd5daa0e30244

        private stk: T[];

        constructor() {
            super();
            this.stk = [];

<<<<<<< HEAD
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
=======
        /**
         * Expose 시에 노출할 내부 정보들을 등록한다.
         */
        this.makeExpose(() => ({
            stack: [...this.stk]
        }));
        // 형태 : 객체
        // 자료형 : T[]
        // this.stk 값을 산개시켜줌.
        // #exposeFn 함수가 된다.
    }

    public push(value: T): void {
        this.stk.push(value);
        this.notifyChange({ type: "push", value: value });
    }

    public pop(): T {
        const value = this.stk.pop();
        this.notifyChange({ type: "pop", value: value });
        return value;
    }

    public size(): number {
        return this.stk.length;
    }
>>>>>>> 9e2d2ee1a4969b6aba6c9f40f29dd5daa0e30244
}

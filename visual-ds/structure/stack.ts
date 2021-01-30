import { DSBase } from "./base";

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

    private stk: T[];

    constructor() {
        super();
        this.stk = [];

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
}

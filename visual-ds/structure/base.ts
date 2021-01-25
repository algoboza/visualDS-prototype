export interface DSBase {
    name: string;
}
export type Visualizable = string | number | DSBase; // types that visualizable.

export interface ActionArgs {
    value?: Visualizable;
}

interface NotifyHandler {
    (e: ActionArgs): void; // Action Args 타입의 event Handler 가 인자인 void 함수
    // Anonymous function
}

export class DSObservable<TExpose> { // Generic which is used by DSObservable
    #handlers: { [action: string]: NotifyHandler[] };
    #expose: TExpose;

    constructor() {
        this.#handlers = {}; // 
    }

    notifyChange(action: string, e: ActionArgs): void {
        this.#handlers[action].forEach((handler) => handler({ ...e }));
    }

    addActionHandler(action: string, f: NotifyHandler): void {
        if (!Array.isArray(this.#handlers[action])) {
            this.#handlers[action] = [];
        }
        if (!this.#handlers[action].find((handler) => handler === f)) {
            this.#handlers[action].push(f);
        }
    }

    set expose(exposes: TExpose) {
        this.#expose = exposes;
    }

    get expose(): TExpose {
        return this.#expose;
    }
}

export interface DSBase {
    name: string;
}
export type Visualizable = string | number | DSBase;

export interface ActionArgs<TExpose> {
    value?: Visualizable;
    expose: TExpose;
}

interface NotifyHandler<TExpose> {
    (e: ActionArgs<TExpose>): void;
}

export class DSObservable<TExpose> {
    #handlers: { [action: string]: NotifyHandler<TExpose>[] };

    constructor() {
        this.#handlers = {};
    }

    notifyChange(action: string, e: ActionArgs<TExpose>): void {
        this.#handlers[action].forEach((handler) => handler(e));
    }

    addActionHandler(action: string, f: NotifyHandler<TExpose>): void {
        if (!Array.isArray(this.#handlers[action])) {
            this.#handlers[action] = [];
        }
        if (!this.#handlers[action].find((handler) => handler === f)) {
            this.#handlers[action].push(f);
        }
    }
}

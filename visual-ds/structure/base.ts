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
    #expose: TExpose;

    constructor() {
        this.#handlers = {};
    }

    notifyChange(action: string, e: Omit<ActionArgs<TExpose>, "expose">): void {
        this.#handlers[action].forEach((handler) =>
            handler({ ...e, expose: Object.assign({}, this.#expose) })
        );
    }

    addActionHandler(action: string, f: NotifyHandler<TExpose>): void {
        if (!Array.isArray(this.#handlers[action])) {
            this.#handlers[action] = [];
        }
        if (!this.#handlers[action].find((handler) => handler === f)) {
            this.#handlers[action].push(f);
        }
    }

    setExpose(exposes: TExpose): void {
        this.#expose = exposes;
    }
}

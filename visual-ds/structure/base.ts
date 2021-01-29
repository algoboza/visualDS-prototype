export interface DSBase {
    name: string;
}
export type Visualizable = string | number | DSBase; // types that visualizable.

export interface ActionArgs {
    value?: Visualizable;
}

interface NotifyHandler {
    (e: ActionArgs): void;
}

export class DSObservable<TExpose> {
    #handlers: { [action: string]: NotifyHandler[] };
    #exposeFn: () => TExpose;

    constructor() {
        this.#handlers = {};
    }

    notifyChange(action: string, e: ActionArgs): void {
        this.#handlers[action]?.forEach((handler) => handler({ ...e }));
    }

    addActionHandler(action: string, f: NotifyHandler): void {
        if (!Array.isArray(this.#handlers[action])) {
            this.#handlers[action] = [];
        }
        if (!this.#handlers[action].find((handler) => handler === f)) {
            this.#handlers[action].push(f);
        }
    }

    removeActionHandler(action: string, f: NotifyHandler): void {
        const idx = this.#handlers[action]?.findIndex((fn) => fn === f);
        if (idx === undefined || idx === -1) {
            return;
        }
        this.#handlers[action].splice(idx, 1);
    }

    protected onExpose(exposeFn: () => TExpose): void {
        this.#exposeFn = exposeFn;
    }

    get expose(): TExpose {
        return this.#exposeFn();
    }
}

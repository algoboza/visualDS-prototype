export interface DSBase {
    name: string;
}
export type Visualizable = string | number | DSBase;

export interface ActionArgs {
    value?: Visualizable;
}

interface NotifyHandler {
    (e: ActionArgs): void;
}

export class Observable {
    #handlers: { [action: string]: NotifyHandler[] };

    constructor() {
        this.#handlers = {};
    }

    notifyChange(action: string, e: ActionArgs): void {
        this.#handlers[action].forEach((handler) => handler(e));
    }

    addActionHandler(action: string, f: NotifyHandler): void {
        if (!Array.isArray(this.#handlers[action])) {
            this.#handlers[action] = [];
        }
        if (!this.#handlers[action].find((handler) => handler === f)) {
            this.#handlers[action].push(f);
        }
    }
}

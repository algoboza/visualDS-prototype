export interface Data {
    type: "string" | "number";
}

export class Visualizer {
    constructor() {}
}

interface NotifyHandler {
    (): void;
}

export class Notifyable {
    #handlers: NotifyHandler[];
    constructor() {
        this.#handlers = [];
    }

    notifyChange(): void {
        this.#handlers.forEach((handler) => handler());
    }

    addChangeHandler(f: () => void): void {
        if (!this.#handlers.find((handler) => handler === f)) {
            this.#handlers.push(f);
        }
    }
}

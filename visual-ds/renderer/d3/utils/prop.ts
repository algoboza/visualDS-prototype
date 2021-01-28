export interface PropHandler<T> {
    (value: T): void;
}

export interface PropGlobalHandler<T> {
    (prop: keyof T | string | number | symbol, value: T[keyof T]): void;
}

export function makeProps<T extends object>(
    props: T,
    defaultProps: Required<T>,
    handlers?: { [P in keyof T]?: PropHandler<T[P]> } | PropGlobalHandler<T>
): T {
    if (handlers === undefined) {
        handlers = {};
    }

    const setter: ProxyHandler<T>["set"] = (obj, prop, value) => {
        if (handlers instanceof Function) {
            handlers(prop, value);
        } else {
            const handler = handlers[prop];
            if (handler && typeof handler === "function") {
                handler(value);
            }
        }

        obj[prop] = value;

        return true;
    };

    const proxy = new Proxy<T>({ ...defaultProps, ...props }, { set: setter });

    return proxy;
}

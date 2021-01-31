export interface PropHandler<T> {
    (value: T): void;
}

export interface PropGlobalHandler<T> {
    (prop: keyof T | string | number | symbol, value: T[keyof T]): void;
} // prop type : T | string ~ , value type : T[keyof T]

/**
 * 변경 사항시 이벤트를 호출해주는 props 객체 생성
 * @param props : prop들의 기본값 객체
 * @param handlers : prop 변경시 호출될 이벤트 객체 혹은 함수
 */
export function makeProps<T extends object>(
    props: T,
    handlers?: { [P in keyof T]?: PropHandler<T[P]> } | PropGlobalHandler<T>
): T {
    if (handlers === undefined) {
        handlers = {};
    }

    const setter: ProxyHandler<T>["set"] = (obj, prop, value) => {
        obj[prop] = value;

        if (typeof handlers === "function") {
            // handlers 에 이벤트 함수가 들어왔을경우

            const fn: PropGlobalHandler<T> = handlers;
            fn(prop, value);
        } else {
            // handlers 에 이벤트 객체가 들어왔을 경우

            const handler = handlers[prop];
            if (handler && typeof handler === "function") {
                const fn: PropHandler<T> = handler;
                fn(value);
            }
        }

        return true;
    };

    const proxy = new Proxy<T>({ ...props }, { set: setter });
    // 프록시 객체의 용도 ???
    return proxy;
}

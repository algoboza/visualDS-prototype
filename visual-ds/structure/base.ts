/**
 * @deprecated
 */
export type Visualizable = string | number | DSBase<unknown>; // types that visualizable.

/*
 * 화면에 자료구조를 그리기 위해서는 일반적으로 노출되지 않아야 할 내부의
 * 자세한 정보들이 필요하다. 그러나 모든 내부 정보를 노출시키면 정보 은닉을
 * 달성할 수 없다. 따라서 객체에서는 자료구조의 일반적인 조작만 할 수 있고,
 * 자세한 내부 정보는 별도의 getExpose 함수를 통해서만 얻을 수 있게 한다.
 */

// 자료구조의 Expose에 접근할 수 있는 유일한 키
const ExposeKey = Symbol("Data Structure Expose Key");

// 자료구조의 Observer 배열에 접근할 수 있는 유일한 키
const ObserverKey = Symbol("Data Structure Observer Key");

interface ChangeArgs {
    type: string;
}

/**
 * 변경을 수신할 Observer 함수
 */
export interface DSObserver<TArgs = ChangeArgs> {
    (args: TArgs): void;
}

/**
 * 옵저버 패턴을 구현하는 자료구조의 인터페이스
 */
interface DSObservable<TNotify> {
    subscribe(observer: DSObserver<TNotify>): void;
    unsubscribe(observer: DSObserver<TNotify>): void;
}

/**
 * 자료구조 내부의 데이터를 Expose 할수 있게 하는 인터페이스
 */
interface DSExposable<TExpose> {
    [ExposeKey]: DSExposeFn<TExpose>;
}

/**
 * 자료구조 데이터를 Expose시키는 함수 인터페이스
 */
interface DSExposeFn<TExpose> {
    (): TExpose;
}

/**
 * 상태변경을 감시할 수 있는 자료구조의 기본형
 * DSObservable 인터페이스를 구현함으로써 자료구조의 변경시 subscriber에게 변경을 통지해 줄 수 있고,
 * DSExposable 인터페이스를 구현함으로써 자료구조의 내부 데이터를 외부로 노출시킬 수 있다.
 */
export class DSBase<TExpose, TNotify = ChangeArgs>
    implements DSObservable<TNotify>, DSExposable<TExpose> {
    // 일반적인 방법으로 Observer 배열과 Expose 함수에 접근할 수 없게 한다.
    [ObserverKey]: DSObserver<TNotify>[];
    [ExposeKey]: DSExposeFn<TExpose>;

    constructor() {
        this[ObserverKey] = [];
        this[ExposeKey] = null;
    }

    /**
     * Expose 요청시 데이터를 노출시키는 함수
     * @param fn Expose시 호출될 함수
     */
    protected makeExpose(fn: DSExposeFn<TExpose>): void {
        this[ExposeKey] = fn;
    }

    /**
     * 변경사항을 구독할 Observer를 등록한다.
     * @param observer 변경사항을 수신할 Observer
     */
    public subscribe(observer: DSObserver<TNotify>): void {
        if (this[ObserverKey].findIndex((ob) => ob === observer) === -1) {
            this[ObserverKey].push(observer);
        }
    }

    /**
     * 구독하고있는 Observe를 해제한다.
     * @param observer 구독 해제할 Observer
     */
    public unsubscribe(observer: DSObserver<TNotify>): void {
        const idx = this[ObserverKey].findIndex((ob) => ob === observer);
        if (idx != -1) {
            this[ObserverKey].splice(idx, 1);
        }
    }

    /**
     * 변경사항을 구독자들에게 통지한다.
     * @param args
     */
    protected notifyChange(args: TNotify): void {
        this[ObserverKey].forEach((observer) => observer(args));
    }
}

/**
 * 자료구조에서 Expose 데이터를 추출한다.
 * @param structure Expose를 추출할 자료구조
 */
export function getExpose<TExpose>(structure: DSBase<TExpose>): TExpose {
    if (structure[ExposeKey] !== null) {
        return structure[ExposeKey]();
    }
}

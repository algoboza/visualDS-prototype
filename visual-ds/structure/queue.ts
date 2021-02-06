import { DSBase } from './base';

/**
 * queue 내부정보, 타입은 넣는대로 결정됨
 */
export interface QueueExpose<T> {
    queue: T[];
}

interface PushArgs<T> {
    type: 'push';
    value: T;
}

interface PopArgs<T> {
    type: 'pop';
    value: T;
}

/**
 * Observer 에 변경 통지 시의 파라미터
 */
type ChangeArgs<T> = PushArgs<T> | PopArgs<T>;

export class Queue<T = unknown> extends DSBase<QueueExpose<T>, ChangeArgs<T>>{
    public readonly name="Queue";

    private que: T[];

    // this.que 는 상속받음
    // queue 는 상위 클래스, this 용법 주의
    constructor() {
        super();
        this.que=[];
        this.makeExpose(() => ({
            queue: [...this.que]
        }));
    }

    public push(value: T): void {
        this.que=[value,...this.que]; // 큐 푸시?
        this.notifyChange({type: "push", value:value});
    }

    public pop(): T {
        const value=this.que.pop();
        this.notifyChange({type:"pop", value:value});
        return value;
    }

    public size(): number{
        return this.que.length;
    }
    
    
}



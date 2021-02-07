import { DSObserver, getExpose } from "@/visual-ds/structure/base";
import { Queue } from "@/visual-ds/structure/queue";
import * as d3 from 'd3';
import {D3Renderer,GSelection,Selection} from "./general";
import { makeProps } from "./utils/prop";
import { translate } from "./utils/svg";

// export interface QueueD3RendererProps {
//     cellSpace?: number;
//     cellWidth?: number;
//     cellHeight?: number;
//     flyDistance?: number;
//     showLabel?: boolean;
//     showIndex?: boolean;
// }

export class QueueD3Renderer implements D3Renderer {
    private queue: Queue<string>;
    private drawers: Drawer[];
    private observer: DSObserver;
    private root: GSelection;

    constructor(queue: Queue){
        if(!queue || !(queue instanceof Queue)) {
            throw new Error(`${queue} is not valid queue`);
        }
        this.queue=queue;
        this.observer=this.update.bind(this);
    }

    get alive(): boolean {
        return this.root !== null;
    }

    update(): void{
        if(!this.alive){
            return;
        }
        // DSBase 를 상속한 string 형의 queue 객체.
        // .queue 를 더 붙여주는 이유는 객체형이며, queue 키에 찐 큐가 들어있기 때문.
        const que=getExpose(this.queue).queue;

        // drawers 클래스의 TextInput, LineDraw 등등.. 
        // 모든 곳에 queue 를 전달해서 그림 업데이트
        this.drawers.forEach((d)=>d.update(que));
    }

    g(): GSelection {
        return this.root;
    }
    dispose(): void {
        throw new Error("Method not implemented.");
    }
    props: object;

}

abstract class Drawer{
    readonly group: GSelection;

    constructor(parent: Selection<SVGElement>){
        this.group=parent.append("g");
    }

    remove(){
        this.group.remove();
    }
    
    // 데이터 변경 될 때마다 그리기
    abstract update(data: unknown[]): void;
}

// 요소가 추가되는 모션 조절
function transition(selection:Selection){
    return selection.transition().duration(750).ease(d3.easeCubicOut);
}

const INDEX_HEIGHT = 30;
const LABEL_WIDTH = 50;
const LABEL_BOX_SPACE = 5;

// 데이터 글자를 담을 보라색 박스 생성
class BoxDrawer extends Drawer{
    update(queue:unknown[]){
        const group =this.group;
        
        group.attr("fill","#660eb3");
        
        group
        .selectAll("rect") // 존재하지않는 rect 요소에대한 빈 참조 반환
        .data(queue) // queue 데이터 배열
        .join( // onenter, onupdate, onexit 인자 부여하기
            (enter)=>
                enter
                .append("rect")
        )
    }
}
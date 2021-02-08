import { DSObserver, getExpose } from "@/visual-ds/structure/base";
import { Queue } from "@/visual-ds/structure/queue";
import * as d3 from 'd3';
import {D3Renderer,GSelection,Selection} from "./general";
import { makeProps } from "./utils/prop";
import { translate } from "./utils/svg";

export interface QueueD3RendererProps {
    cellSpace?: number;
    cellWidth?: number;
    cellHeight?: number;
    flyDistance?: number;
    showLabel?: boolean;
    showIndex?: boolean;
}


export const defaultQueueD3RendererProps = Object.freeze({
    cellSpace: 5,
    cellWidth: 40,
    cellHeight: 30,
    flyDistance: 40,
    showIndex: true,
    showLabel: true
});

export class QueueD3Renderer implements D3Renderer {
    private queue: Queue<string>;
    private drawers: Drawer[];
    private observer: DSObserver;
    private root: GSelection;
    private _props: QueueD3RendererProps;

    constructor(queue: Queue, props?: QueueD3RendererProps){
        if(!queue || !(queue instanceof Queue)) {
            throw new Error(`${queue} is not valid queue`);
        }
        this.queue=queue;
        this.observer=this.update.bind(this);
        this.queue.subscribe(this.observer);
        this.root = d3.create("svg:g");

        // nullish coalescing operator
        // default value is {} (empty object)
        this.props=props ?? {};
        console.log(this.props);
    }

    get props(): QueueD3RendererProps{
        return this._props;
    }
    
    set props(obj: QueueD3RendererProps){
        this._props = makeProps(
            {
                ...defaultQueueD3RendererProps,
                ...obj
            },
            ()=>{
                this.forceUpdate();
            }
        );
        this.forceUpdate();
    }

    dispose(): void{
        this.root.remove();
        this.root = null;

        this.queue.unsubscribe(this.observer);
    }

    onPush():void{
        this.update();
    }
    onPop(): void {
        this.update();
    }
    init(): void{
        this.drawers=[BoxDrawer,TextDrawer].map((D)=>new D(this.root, this.props))
    }
    forceUpdate(): void{
        if(!this.alive){
            return;
        }
        this.root.selectAll("*").remove();
        this.init();
        this.update();
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
        console.log(que);
        // drawers 클래스의 TextInput, LineDraw 등등.. 
        // 모든 곳에 queue 를 전달해서 그림 업데이트
        this.drawers.forEach((d)=>console.log(d));
    }

    g(): GSelection {
        return this.root;
    }
}

abstract class Drawer{
    readonly group: GSelection;
    readonly props: QueueD3RendererProps;

    constructor(parent: Selection<SVGElement>, props: QueueD3RendererProps){
        this.group=parent.append("g");
        this.props=props;
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

function getBoxStartY(props: QueueD3RendererProps) {
    const { showIndex } = props;
    if (showIndex) {
        return INDEX_HEIGHT;
    } else {
        return 0;
    }
}

// label 표시 가능 시, LABEL_WIDTH 길이부터 X 축 시작.
function getBoxStartX(props: QueueD3RendererProps) {
    const { showLabel } = props;

    if (showLabel) {
        return LABEL_WIDTH;
    } else {
        return 0;
    }
}

// 시작좌표 + 모든 셀 및 공백 거리 * 개수 길이.
function getCellX(props: QueueD3RendererProps, index: number) {
    const { cellWidth, cellSpace } = props;

    return getBoxStartX(props) + (cellWidth + cellSpace) * index;
}

function getBoxEndY(props: QueueD3RendererProps) {
    const { cellHeight } = props;

    return getBoxStartY(props) + cellHeight;
}

// 
function getTopX(props: QueueD3RendererProps, len: number) {
    if (len === 0) {
        return getCellX(props, 0);
    }
    return getCellX(props, len) - props.cellSpace;
}

// 데이터 글자를 담을 보라색 박스 생성
class BoxDrawer extends Drawer{
    update(queue:unknown[]){
        const group =this.group;
        const { cellWidth, cellHeight, flyDistance }=this.props;

        group.attr("fill","#660eb3");
        
        group
        .selectAll("rect") // 존재하지않는 rect 요소에대한 빈 참조 반환
        .data(queue) // queue 데이터 배열
        .join( // onenter, onupdate, onexit 인자 부여하기
            (enter)=>
                enter
                .append("rect")
                .attr("x", (_,i:number)=>getCellX(this.props, i) + flyDistance)
                .attr("opacity",0.0),
            (update)=>update,
            (exit) =>
                exit.call((exit)=>
                    transition(exit)
                    .attr("opacity",0.0)
                    .attr("x", (_, i: number) => getCellX(this.props, i) + flyDistance)
                    .remove()
                )
        )
        .call((group)=>
            transition(group)
            .attr("x", (_, i: number) => getCellX(this.props, i))
            .attr("opacity",1.0)
        )
        .attr("y",getBoxStartY(this.props))
        .attr("height",cellHeight)
        .attr("width",cellWidth)
    }
}

// 데이터의 문자를 그리는 Drawer
class TextDrawer extends Drawer {
    update(queue: unknown[]){
        const group = this.group;

        const { cellWidth, cellHeight, flyDistance } = this.props;

        group.attr("fill","white").attr("text-anchor","middle");

        const flyX = (_: undefined, idx: number) =>
            getCellX(this.props, idx) + cellWidth / 2 + flyDistance;
        const normalX = (_: undefined, idx: number) => getCellX(this.props, idx) + cellWidth / 2;

        return group
            .selectAll("text.val")
            .data(queue)
            .join(
                (enter)=>
                    enter
                    .append("text")
                    .attr("class","val")
                    .attr("x",flyX)
                    .attr("fill-opacity",0.0),
                (update) => update,
                (exit)=>
                    exit.call((exit)=>
                        transition(exit).attr("fill-opacity",0.0).attr("x",flyX).remove()
                    )
            )
            .call((group)=>transition(group).attr("x",normalX).attr("fill-opacity",1.0))
            .text((d) =>d.toString())
            .attr("y", getBoxStartY(this.props) + cellHeight / 2)
            .attr("dy","0.35em");
    }
}


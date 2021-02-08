import { memo, MutableRefObject, useEffect, useRef, useState, VFC } from "react";
/**
 * 1. 큐에 들어갈 데이터 틀 만들기
 * 2. 큐의 틀 만들기
 * 3. 큐 모양 형성 만들기 d3
 */
import { QueueController } from "@/components/controllers/queue";
import { Queue } from "@/visual-ds/structure/queue";
import {QueueD3Renderer,defaultQueueD3RendererProps,QueueD3RendererProps} from "@/visual-ds/renderer/d3/queue";
import { getExpose } from "@/visual-ds/structure/base";
import { D3Board, D3Renderer } from "@/visual-ds/renderer/d3/general";

interface QueueVisualizerProps {
    queueRef: MutableRefObject<Queue>;
    props: QueueD3RendererProps;
}
const QueueVisualizer=memo<QueueVisualizerProps>(
    function Visualizer({queueRef,props}){
        const renderer=useRef<D3Renderer>(null);
        const container =useRef<HTMLDivElement>(null);

        useEffect(()=>{
            const board=new D3Board();
            renderer.current = new QueueD3Renderer(queueRef.current);
            board.add(renderer.current);

            const node=board.node();
            node.style.width="100%";

            container.current.appendChild(node);
            return ()=>{
                board.dispose();
            };
        },[]);

        useEffect(() => {
            renderer.current.props = props;
        }, [props]);

        return <div ref={container}></div>
    },
    () =>{
        return false;
    }
)
const QueueSerializer = <T extends unknown>(props: { data: T[] }) => {
    const { data = [] } = props;
    function serialize(data: T[]) {
        let ret = "";

        ret += data.length + "\n";
        for (let v of data) {
            ret += `${v} `;
        }
        ret += "\n";

        return ret;
    }

    return (
        <div>
            <pre>{serialize(data)}</pre>
        </div>
    );
};
export default(function QueueD3(){
        const queue=useRef<Queue>(new Queue());

        const [currentQueue, setCurrentQueue]=useState(()=>[]);

        const [currentProps, setCurrentProps] = useState<QueueD3RendererProps>(
            () => defaultQueueD3RendererProps
        );

        function handlePush(value: string) {
            queue.current.push(value);
            setCurrentQueue(getExpose(queue.current).queue);
            console.log("Q push");
        }
    
        function handlePop() {
            queue.current.pop();
            setCurrentQueue(getExpose(queue.current).queue);
            console.log("Q pop");
        }

        function handlePropsChange(key: string, value: unknown) {
            setCurrentProps({ ...currentProps, [key]: value });
        }
        return(
            <div>
                <QueueController onPush={handlePush} onPop={handlePop}></QueueController>
                <QueueVisualizer queueRef={queue} props={currentProps} />
                <QueueSerializer data={currentQueue} />
            </div>
        )
    }
)
 
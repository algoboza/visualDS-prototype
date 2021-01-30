import { memo, MutableRefObject, useEffect, useRef, useState, VFC } from "react";
import { StackController } from "@/components/controllers/stack";
import { Stack } from "@/visual-ds/structure/stack";
import { StackD3Renderer } from "@/visual-ds/renderer/d3/stack";
import { getExpose } from "@/visual-ds/structure/base";

interface StackVisualizerProps {
    stackRef: MutableRefObject<Stack>;
}

/**
 * 스택을 prop으로 받아서 렌더링
 */
const StackVisualizer = memo<StackVisualizerProps>(
    function Visualizer({ stackRef }) {
        const renderer = useRef<StackD3Renderer>(null);
        const container = useRef<HTMLDivElement>(null);

        useEffect(() => {
            renderer.current = new StackD3Renderer(stackRef.current);
            const node = renderer.current.node();
            container.current.appendChild(node);

            return () => {
                renderer.current.remove();
            };
        }, []);

        return <div ref={container}></div>;
    },
    () => {
        return false;
    }
);

const StackSerializer = <T extends unknown>(props: { data: T[] }) => {
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

export default (function StackD3() {
    // 구현한 스택 자료구조는 불변성이 없으므로 Ref로 사용
    const stack = useRef<Stack>(new Stack());

    const [currentStack, setCurrentStack] = useState([]);

    useEffect(() => {}, []);

    function handlePush(value: string) {
        stack.current.push(value);

        setCurrentStack(getExpose(stack.current).stack);
    }

    function handlePop() {
        stack.current.pop();

        setCurrentStack(getExpose(stack.current).stack);
    }

    return (
        <div>
            <StackController onPush={handlePush} onPop={handlePop} />
            <StackVisualizer stackRef={stack} />
            <StackSerializer data={currentStack} />
        </div>
    );
} as VFC);

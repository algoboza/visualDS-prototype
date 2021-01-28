import { memo, MutableRefObject, useEffect, useRef, useState, VFC } from "react";
import { StackController } from "@/components/controllers/stack";
import { Stack } from "@/visual-ds/structure/stack";
import { StackD3Renderer } from "@/visual-ds/renderer/d3/stack";
import { Visualizable } from "@/visual-ds/structure/base";

interface StackVisualizerProps {
    stackRef: MutableRefObject<Stack>;
}


const Visualizer = memo<StackVisualizerProp>(
    // memo 함수를 통해 Visualizer 컴포넌트 리렌더링 효율 향상
    function Visualizer({ stackRef }) {
        // props 로 Stack 자료구조의 current 반환.
        console.log(stackRef);
        const renderer = useRef<StackD3Renderer>(null);
        const container = useRef<HTMLDivElement>(null);

        useEffect(() => {
            renderer.current = new StackD3Renderer(stackRef.current);
            const node = renderer.current.node();
            container.current.appendChild(node);

            return () => node.remove();
        }, []);

        return <div ref={container}></div>;
    },
    () => {
        return false;
    }
);

const StackSerializer = (props: { data: Visualizable[] }) => {
    const { data = [] } = props;
    function serialize(data: Visualizable[]) {
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
    // default 스택 페이지
    const stack = useRef<Stack>(new Stack());
    // 자료형 : Stack
    // Stack 자료구조의 기본 형태를 갖는다.

    const [currentStack, setCurrentStack] = useState([]);
    // currentStack 기본 값은 [], setCurrentStack 으로 set 가능.

    function handlePush(value: string) {
        stack.current.push(value);
        setCurrentStack(stack.current.expose.stack);
    }

    function handlePop() {
        stack.current.pop();

        setCurrentStack(stack.current.expose.stack);
    }

    return (
        <div>
            <StackController onPush={handlePush} onPop={handlePop} />
            <StackVisualizer stackRef={stack} />
            <StackSerializer data={currentStack} />
        </div>
    );
} as VFC);

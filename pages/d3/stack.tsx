import { memo, MutableRefObject, useEffect, useRef, useState, VFC } from "react";
import { StackController } from "@/components/controllers/stack";
import { Stack } from "@/visual-ds/structure/stack";
import { StackD3Renderer } from "@/visual-ds/renderer/d3/stack";

interface VisualizerProps {
    stackRef: MutableRefObject<Stack>;
}

const Visualizer = memo<VisualizerProps>(
    function Visualizer({ stackRef }) {
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

export default (function StackD3() {
    const stack = useRef<Stack>(new Stack());

    const [currentStack, setCurrentStack] = useState([]);

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
            <Visualizer stackRef={stack} />
            {JSON.stringify(currentStack)}
        </div>
    );
} as VFC);

import { useEffect, useRef, VFC } from "react";
import { StackController } from "@/components/controllers/stack";
import { Stack } from "@/visual-ds/structure/stack";
import { StackD3Renderer } from "@/visual-ds/renderer/d3/stack";

export default (function StackD3() {
    const container = useRef<HTMLDivElement>(null);
    const stack = useRef<Stack>(null);
    const renderer = useRef<StackD3Renderer>(null);
    console.log("stacking");
    console.log(stack);
    useEffect(() => {
        stack.current = new Stack();
        renderer.current = new StackD3Renderer(stack.current);

        const node = renderer.current.node();

        container.current.appendChild(node);

        return () => {
            node.remove();
        };
    });

    function handlePush(value: string) {
        stack.current.push(value);
    }

    function handlePop() {
        stack.current.pop();
    }

    return (
        <div>
            <StackController onPush={handlePush} onPop={handlePop} />
            <div ref={container}></div>
        </div>
    );
} as VFC);

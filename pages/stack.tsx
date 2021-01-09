import { Data } from "@/visual-ds/base";
import { Stack } from "@/visual-ds/stack";
import { StackSVGRenderer } from "@/visual-ds/svg/stack";
import { useEffect, useRef, VFC } from "react";

export default (function StackSVG() {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const stk = new Stack<Data>();
        const stackSVGRenderer = new StackSVGRenderer(stk);
        container.current.appendChild(stackSVGRenderer.node);

        return () => {
            container.current.removeChild(stackSVGRenderer.node);
        };
    }, []);
    return <div ref={container}></div>;
} as VFC);

import { Visualizable } from "@/visual-ds/structure/base";
import { Stack } from "@/visual-ds/structure/stack";
import { StackSVGRenderer } from "@/visual-ds/renderer/svgjs/stack";
import { useEffect, useRef, useState, VFC } from "react";

interface StackControllerProps {
    onPush?: (value: string) => void;
    onPop?: () => void;
}

const StackController: VFC<StackControllerProps> = (props) => {
    const { onPush, onPop } = props;

    const [value, setValue] = useState("");

    function event<T extends Function>(evt: T) {
        if (typeof evt == "function") {
            return { trigger: evt };
        }
        return { trigger: () => {} };
    }

    function handleValueChange({ target: { value } }) {
        setValue(value);
    }

    function handlePush() {
        event(onPush).trigger(value);
        setValue(() => "");
    }

    function handlePop() {
        event(onPop).trigger();
    }

    return (
        <div>
            <input type="text" onChange={handleValueChange} value={value} />
            <button onClick={handlePush}>Push</button>
            <button onClick={handlePop}>Pop</button>
        </div>
    );
};

export default (function StackSVG() {
    const container = useRef<HTMLDivElement>(null);
    const stack = useRef<Stack<Visualizable>>(null);

    useEffect(() => {
        const stk = new Stack<Visualizable>();
        stack.current = stk;
        const stackSVGRenderer = new StackSVGRenderer(stk);

        container.current.appendChild(stackSVGRenderer.node);

        return () => {
            container.current.removeChild(stackSVGRenderer.node);
        };
    }, []);

    function handlePush(value: string) {
        if (value === "") {
            return;
        }
        stack.current.push(value);
    }

    function handlePop() {
        console.log(stack.current);
        if (stack.current.size() > 0) {
            stack.current.pop();
        }
    }

    return (
        <div>
            <StackController onPush={handlePush} onPop={handlePop} />
            <div ref={container}></div>
        </div>
    );
} as VFC);

import { memo, MutableRefObject, useEffect, useRef, useState, VFC } from "react";
import { StackController, StackPropController } from "@/components/controllers/stack";
import { Stack } from "@/visual-ds/structure/stack";
import {
    defaultStackD3RendererProps,
    StackD3Renderer,
    StackD3RendererProps
} from "@/visual-ds/renderer/d3/stack";
import { getExpose } from "@/visual-ds/structure/base";
import { D3Board, D3Renderer } from "@/visual-ds/renderer/d3/general";

// useRef 로 얻어온 current 객체
interface StackVisualizerProps {
    stackRef: MutableRefObject<Stack>;
    props: StackD3RendererProps;
}

/**
 * 스택을 prop으로 받아서 렌더링
 * memo 함수를 통해 Visualizer 컴포넌트 리렌더링 효율 향상
 * container 형은 HTMLDivElement 형태. 일반적인 HTML 태그.
 */
const StackVisualizer = memo<StackVisualizerProps>(
    function Visualizer({ stackRef, props }) {
        const renderer = useRef<D3Renderer>(null);
        const container = useRef<HTMLDivElement>(null);

        useEffect(() => {
            // Board를 먼저 만들고 거기에 Renderer 추가
            const board = new D3Board();
            renderer.current = new StackD3Renderer(stackRef.current, props);

            board.add(renderer.current);

            const node = board.node();

            node.style.width = "100%";

            container.current.appendChild(node);
            return () => {
                board.dispose(); // Unmount 시, clean-up.
            };
        }, []);

        useEffect(() => {
            renderer.current.props = props;
        }, [props]);

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
    // default 스택 페이지
    // 구현한 스택 자료구조는 불변성이 없으므로 Ref로 사용
    const stack = useRef<Stack>(new Stack());
    // 자료형 : Stack
    // Stack 자료구조의 기본 형태를 갖는다.

    const [currentStack, setCurrentStack] = useState(() => []);
    // currentStack 기본 값은 [], setCurrentStack 으로 set 가능.

    const [currentProps, setCurrentProps] = useState<StackD3RendererProps>(
        () => defaultStackD3RendererProps
    );

    function handlePush(value: string) {
        stack.current.push(value);

        setCurrentStack(getExpose(stack.current).stack);
    }

    function handlePop() {
        stack.current.pop();

        setCurrentStack(getExpose(stack.current).stack);
    }

    function handlePropsChange(key: string, value: unknown) {
        setCurrentProps({ ...currentProps, [key]: value });
    }

    return (
        <div>
            <StackController onPush={handlePush} onPop={handlePop} />
            <StackVisualizer stackRef={stack} props={currentProps} />
            <StackSerializer data={currentStack} />
            <StackPropController rendererProps={currentProps} onPropsChange={handlePropsChange} />
        </div>
    );
} as VFC);

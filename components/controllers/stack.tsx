import { KeyboardEvent, useState, VFC } from "react";

export interface StackControllerProps {
    onPush?: (value: string) => void;
    onPop?: () => void;
}
// props 에 대한 인터페이스. 자료형 고정 유의.

export const StackController: VFC<StackControllerProps> = (props) => {
    const { onPush, onPop } = props;

    const [value, setValue] = useState("");
    // 임시 변수 value.

    function event<T extends Function>(evt: T) {
        if (typeof evt == "function") {
            return { trigger: evt };
        }
        return { trigger: () => {} };
    }

    function handleValueChange({ target: { value } }) {
        setValue(value);
    }
    // 현재 입력 값 trace 하는 역할.

    function handlePush() {
        if (value === "") {
            return;
        }
        event(onPush).trigger(value);
        setValue(() => "");
    }
    // stack Push trigger 하는 역할.

    function handlePop() {
        event(onPop).trigger();
    }
    

    function handleKeyPress(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key == "Enter") {
            handlePush();
        }
    }

    return (
        <div>
            <input
                type="text"
                onChange={handleValueChange}
                value={value}
                onKeyPress={handleKeyPress}
            />
            <button onClick={handlePush}>Push</button>
            <button onClick={handlePop}>Pop</button>
        </div>
    );
};

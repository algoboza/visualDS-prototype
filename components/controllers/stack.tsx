import { KeyboardEvent, useState, VFC } from "react";

export interface StackControllerProps {
    onPush?: (value: string) => void;
    onPop?: () => void;
}

export const StackController: VFC<StackControllerProps> = (props) => {
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
        if (value === "") {
            return;
        }
        event(onPush).trigger(value);
        setValue(() => "");
    }

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

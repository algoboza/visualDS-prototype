import { StackD3RendererProps } from "@/visual-ds/renderer/d3/stack";
import { Button, TextField } from "@material-ui/core";
import { ToggleButton } from "@material-ui/lab";

import { KeyboardEvent, useRef, useState, VFC } from "react";

interface FieldProps {
    label: string;
    props: object;
    propKey: string;
    onChange(key: string, value: unknown): void;
}

const NumberField: VFC<FieldProps> = function NumberField({
    label = "",
    props,
    propKey = "",
    onChange = () => {}
}) {
    return (
        <TextField
            type="number"
            label={label}
            value={props[propKey]}
            onChange={({ target: { value } }) => onChange(propKey, parseInt(value))}
        />
    );
};

const BooleanField: VFC<FieldProps> = function BooleanField({
    label = "",
    props,
    propKey = "",
    onChange = () => {}
}) {
    return (
        <ToggleButton
            value={props[propKey]}
            selected={props[propKey] === true}
            onChange={() => onChange(propKey, !props[propKey])}>
            {label}
        </ToggleButton>
    );
};

export interface StackControllerProps {
    onPush?: (value: string) => void;
    onPop?: () => void;
}
// props 에 대한 인터페이스. 자료형 고정 유의.

export const StackController: VFC<StackControllerProps> = (props) => {
    const { onPush, onPop } = props;

    const [value, setValue] = useState("");
    // 임시 변수 value.

    const inputRef = useRef(null);

    function event<T extends Function>(evt: T) {
        if (typeof evt == "function") {
            return { trigger: evt };
        }
        return { trigger: () => {} };
    }
    
    // 현재 입력 값 trace 하는 역할.
    function handleValueChange({ target: { value } }) {
        setValue(value);
    }

    function handlePush() {
        if (value === "") {
            return;
        }
        event(onPush).trigger(value);
        setValue(() => "");
        inputRef.current.focus();
    }
    // stack Push trigger 하는 역할.

    function handlePop() {
        event(onPop).trigger();
    }

    function handleKeyPress(e: KeyboardEvent) {
        if (e.key == "Enter") {
            handlePush();
        }
    }

    return (
        <div>
            <TextField
                inputRef={inputRef}
                onChange={handleValueChange}
                value={value}
                onKeyPress={handleKeyPress}
                variant="outlined"
                size="small"
            />
            <Button onClick={handlePush} color="primary" variant="outlined">
                Push
            </Button>
            <Button onClick={handlePop} color="primary" variant="outlined">
                Pop
            </Button>
        </div>
    );
};

interface StackPropControllerProps {
    rendererProps: StackD3RendererProps;
    onPropsChange(key: string, value: unknown): void;
}

export const StackPropController: VFC<StackPropControllerProps> = (props) => {
    const { rendererProps, onPropsChange = () => {} } = props;

    return (
        <div>
            <BooleanField
                label="Show Label"
                props={rendererProps}
                propKey="showLabel"
                onChange={onPropsChange}
            />
            <BooleanField
                label="Show Index"
                props={rendererProps}
                propKey="showIndex"
                onChange={onPropsChange}
            />

            <NumberField
                label="Cell Height"
                props={rendererProps}
                propKey="cellHeight"
                onChange={onPropsChange}
            />
            <NumberField
                label="Cell Width"
                props={rendererProps}
                propKey="cellWidth"
                onChange={onPropsChange}
            />
            <NumberField
                label="Cell Space"
                props={rendererProps}
                propKey="cellSpace"
                onChange={onPropsChange}
            />
            <NumberField
                label="Fly Distance"
                props={rendererProps}
                propKey="flyDistance"
                onChange={onPropsChange}
            />
        </div>
    );
};

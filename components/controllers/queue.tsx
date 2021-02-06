import { KeyboardEvent, useRef, useState, VFC } from "react";
import { Button, TextField } from "@material-ui/core";
import { ToggleButton } from "@material-ui/lab"; 

/**
 * 큐 모양 조절을 위한 props
 */
// interface FieldProps{
//     label: string;
//     props:object;
//     propKey: string;
//     onChange(key: string, value:null): void;
// }

export interface QueueControllerProps{
    onPush?: (value:string)=>void;
    onPop?:()=>void;
}
export const QueueController: VFC<QueueControllerProps> = (props)=>{
    const { onPush, onPop }=props;
    const [value, setValue] = useState("");
    const inputRef = useRef(null); // input dom 선택용 쓰이진않음.

    // 이벤트 함수 구분용
    const event = <T extends Function>(e: T)=>{
        if(typeof e=="function"){
            return { trigger: e };
        }
        return { trigger: ()=>{} };
    }

    // queue 현재 입력 값 trace
    // target 은 e 의 값
    /**
     * e 의 자동 구조분해할당으로 target 만 받아오기 가능
     */
    const handleValueChange = (e:React.ChangeEvent<HTMLInputElement>) =>{
        let {value}=e.target;
        setValue(value);
    }

    const handlePush = () => {
        if(value===""){
            return;
        }
        event(onPush).trigger(value);
    }

    const handlePop = () =>{
        event(onPop).trigger();
    }

    // 여타 다른 키도 핸들링 가능
    const handleKeyPress=(e:KeyboardEvent) => {
        if(e.key=="Enter"){
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
    )
}

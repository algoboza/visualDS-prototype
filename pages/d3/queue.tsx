import { memo, MutableRefObject, useEffect, useRef, useState, VFC } from "react";
/**
 * 1. 큐에 들어갈 데이터 틀 만들기
 * 2. 큐의 틀 만들기
 * 3. 큐 모양 형성 만들기 d3
 */
import { QueueController } from "@/components/controllers/queue";
import { Queue } from "@/visual-ds/structure/queue";

export default(function QueueD3(){
        function handlePush(value: string) {
            console.log("Q push");
        }
    
        function handlePop() {
            console.log("Q pop");
        }
        return(
            <QueueController onPush={handlePush} onPop={handlePop}></QueueController>
        )
    }
)
 
import * as d3 from 'd3';
import { transition } from 'd3';
import React, { useRef, useEffect, useState } from "react";

export default(function Tested(){
    const data = [25, 30, 45, 60, 20];
    const svgRef=useRef(null);
    useEffect(() => {
        const svg=d3.select(svgRef.current)
        .selectAll("rect") // 존재하지않는 rect 요소에대한 빈 참조 반환
        .data(data)
        .join(
            (enter)=>
                enter.append("rect").attr("x",(_,i:number=1)=>i+5).attr("opacity",5.0),
        )
        .attr("y",5)
        .attr("height",50)
        .attr("width",50)
        .append("font").attr("color","black").text(function(d){return d});
    }, []);
    return(
        <>
            <svg ref={svgRef}></svg>
        </>
    )
})

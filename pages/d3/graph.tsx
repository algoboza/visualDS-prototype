import { Graph } from "@/visual-ds/structure/graph";
import { useEffect, useRef, VFC } from "react";

export default (function () {
    const graph = useRef(null);

    useEffect(() => {
        graph.current = new Graph<string>();

        console.log(graph.current);
    });
    return <div></div>;
} as VFC);

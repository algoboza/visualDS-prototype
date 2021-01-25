interface DSBase {
    name: string;
}
interface ActionArgs {
    value?: Visualizable; // 
}
interface NotifyHandler {
    (e: ActionArgs): void;
}
type Visualizable = string | number | DSBase;

function main(){
    let a:Visualizable=123;
    
    console.log(a);
}
main();
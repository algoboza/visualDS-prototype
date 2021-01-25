function first<T>(arr: T[]): T {
    console.log(typeof(arr[0]));
    return arr[0];
}
console.log(first<number>([1,2,3]));
console.log(first<string>(['1','2','3']));
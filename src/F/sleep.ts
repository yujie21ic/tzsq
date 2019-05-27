export const sleep = <T>(ms: number, ret?: T) =>
    new Promise(resolve => setTimeout(resolve, ms, ret))
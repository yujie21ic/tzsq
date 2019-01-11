export const safeJSONParse = (str: string) => {
    try {
        return JSON.parse(str)
    } catch (e) {
        return undefined
    }
} 
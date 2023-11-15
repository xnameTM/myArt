export function shortenText(text: string, length: number) {
    if (text.length > length) {
        const indexOfNextSpace = text.substring(50).indexOf(' ');

        if (indexOfNextSpace != -1)
            return text.substring(0, length + indexOfNextSpace) + '...';
    }

    return text;
}

export function formatDesciption(text: string, length: number = -1) {
    const formattedText = text.replace(/(<([^>]+)>)/ig, "");

    if (length <= 0)
        return formattedText;

    return shortenText(formattedText, length);
}

export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
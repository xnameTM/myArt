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
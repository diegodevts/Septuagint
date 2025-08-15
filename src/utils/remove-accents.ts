export const removeGreekAccents = (text: string) => {
    if (!text) return "";

    const normalized = text.normalize("NFD");
    const withoutDiacritics = normalized.replace(/[\u0300-\u036f]/g, "");

    return withoutDiacritics
        .replace(/\u1FBD/g, "")
        .replace(/\u1FFE/g, "")
        .replace(/\u0345/g, "")
        .normalize("NFC");
};

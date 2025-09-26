export const removeGreekAccents = (text: string) => {
    if (!text) return "";
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^α-ωΑ-Ω]/g, "")
        .toLowerCase()
        .trim();
};

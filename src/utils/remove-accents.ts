export const removeGreekAccents = (text: string) => {
    if (!text) return "";
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove acentos combinantes
        .replace(/[^α-ωΑ-Ω]/g, "") // mantém só letras gregas
        .toLowerCase()
        .trim();
};

export function capitalizeFirstLetter(text: string) {
    return text.replace(/(^|\s)\S/g, function (firstChar) {
        return firstChar.toUpperCase();
    });
}

export function normalizeBookName(
    stringArray: string[],
    bookFromSearch: string
) {
    const normalizedArray = stringArray.map((string) =>
        string
            .split(" (")[0]
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
    );

    const normalizedStr = bookFromSearch
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    return normalizedArray.indexOf(normalizedStr);
}

function separarAlfabetos(input: string) {
    const caracteresGregos =
        input.match(/[\u0370-\u03FF\u1F00-\u1FFF]+/g) || [];
    const caracteresOcidentais = input.match(/[a-zA-Z]+/g) || [];

    return {
        gregos: caracteresGregos.join(""),
        ocidentais: caracteresOcidentais.join("")
    };
}

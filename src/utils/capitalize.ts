export function capitalizeFirstLetter(text: string) {
  return text.replace(/(^|\s)\S/g, function (firstChar) {
    return firstChar.toUpperCase()
  })
}

export function normalizeBookName(stringArray: string[], string: string) {
  const normalizedArray = stringArray.map((string) =>
    string.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  )

  const normalizedStr = string.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  return normalizedArray.indexOf(normalizedStr)
}

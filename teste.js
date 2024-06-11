const formattedResults = ['Primeira', 'Reis']
let book = formattedResults
  .slice(0, formattedResults.length)
  .toString()
  .split(',')
  .join(' ')

const chapter = formattedResults[formattedResults.length - 1]

if (book.includes('Primeira')) {
  book = book.replace(/Primeira/i, '1')
}
console.log(book)
if (book.includes('Segunda')) {
  book.replace('Segunda', '2')
}

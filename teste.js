const voice = ['1', 'Cantares', '4', 'verso', '3']

const book = voice
  .slice(0, voice.indexOf('verso') - 1)
  .toString()
  .split(',')
  .join(' ')
const chapter = voice[voice.indexOf('verso') - 1]
const verse = voice[voice.length - 1]

console.log('livro: ' + book + ' capitulo: ' + chapter + ' verso: ' + verse)

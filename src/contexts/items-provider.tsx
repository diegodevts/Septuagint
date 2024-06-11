import { ReactNode, useEffect, useMemo, useState } from 'react'
import MyContext from './items-context'
import { portuguese } from '../config/septuagint-versions/portuguese-version'
import { greek } from '../config/septuagint-versions/greek-version'

type MyProviderProps = {
  children: ReactNode
}

export const MyProvider = ({ children }: MyProviderProps) => {
  const [bookPage, setBookPage] = useState(1)

  const booksNames = [
    'Gênesis',
    'Êxodo',
    'Levítico',
    'Números',
    'Deuteronômio',
    'Josué',
    'Juízes',
    'Rute',
    '1 Samuel',
    '2 Samuel',
    '1 Reis',
    '2 Reis',
    '1 Crônicas',
    '2 Crônicas',
    'Esdras',
    'Neemias',
    'Ester',
    'Jó',
    'Salmos',
    'Provérbios',
    'Eclesiastes',
    'Cantares',
    'Isaías',
    'Jeremias',
    'Lamentações',
    'Ezequiel',
    'Daniel',
    'Oséias',
    'Joel',
    'Amós',
    'Obadias',
    'Jonas',
    'Miquéias',
    'Naum',
    'Habacuque',
    'Sofonias',
    'Ageu',
    'Zacarias',
    'Malaquias'
  ]
  const [currentBookIndex, setCurrentBookIndex] = useState(0)
  const [greekChapter, setGreekChapter] = useState('1')
  const [portugueseChapter, setPortugueseChapter] = useState('1')
  const [lastBookChapter, setLastBookChapter] = useState(50)
  const [currentBookName, setCurrentBookName] = useState(
    booksNames[currentBookIndex]
  )

  const greekCurrentBook = greek.slice(
    greek.indexOf(booksNames[currentBookIndex]),
    greek.indexOf(booksNames[currentBookIndex + 1])
  )

  const portugueseCurrentBook = portuguese.slice(
    portuguese.indexOf(booksNames[currentBookIndex].toUpperCase()),
    portuguese.indexOf(booksNames[currentBookIndex + 1].toUpperCase())
  )

  useEffect(() => {
    const greekChaptersIndexes = [
      greekCurrentBook.indexOf(`Chapter ${bookPage}`),
      greekCurrentBook.indexOf(`Chapter ${bookPage + 1}`)
    ]
    const portugueseChaptersIndexes = [
      portugueseCurrentBook.indexOf(`Capítulo ${bookPage}`),
      portugueseCurrentBook.indexOf(`Capítulo ${bookPage + 1}`)
    ]

    const greekCurrentChapter = greekCurrentBook.slice(
      greekChaptersIndexes[0],
      greekChaptersIndexes[1]
    )
    const portugueseCurrentChapter = portugueseCurrentBook.slice(
      portugueseChaptersIndexes[0],
      portugueseChaptersIndexes[1]
    )

    setGreekChapter(greekCurrentChapter)
    setPortugueseChapter(portugueseCurrentChapter)
  }, [bookPage, currentBookIndex])

  const totalChapters = greekCurrentBook.split('Chapter').length - 1

  const handleBookPage = (direction: string) => {
    if (
      bookPage == totalChapters &&
      currentBookIndex < 39 &&
      direction == 'right'
    ) {
      setLastBookChapter(bookPage)
      setCurrentBookIndex((current) => current + 1)
      setBookPage(1)
    }

    if (bookPage == 1 && currentBookIndex > 0 && direction == 'left') {
      setCurrentBookIndex((current) => current - 1)
      setBookPage(lastBookChapter)
    }

    if (direction == 'left' && bookPage > 1) {
      setBookPage((current) => current - 1)
    }

    if (direction == 'right' && bookPage < totalChapters) {
      setBookPage((current) => current + 1)
    }
  }

  return (
    <MyContext.Provider
      value={{
        greekChapter,
        portugueseChapter,
        handleBookPage,
        bookPage,
        currentBookIndex,
        setBookPage,
        setCurrentBookIndex,
        portugueseBooksNames: booksNames,
        currentBookName,
        setCurrentBookName
      }}
    >
      {children}
    </MyContext.Provider>
  )
}

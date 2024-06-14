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
  const [currentBookName, setCurrentBookName] = useState(
    booksNames[currentBookIndex]
  )

  const [currentBookStart, currentBookEnd] = [
    booksNames[currentBookIndex],
    booksNames[currentBookIndex + 1]
  ]

  const greekCurrentBook = greek.slice(
    greek.indexOf(currentBookStart),
    greek.indexOf(currentBookEnd)
  )

  const portugueseCurrentBook = portuguese.slice(
    portuguese.indexOf(currentBookStart),
    portuguese.indexOf(currentBookEnd)
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

  return (
    <MyContext.Provider
      value={{
        greekChapter,
        portugueseChapter,
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

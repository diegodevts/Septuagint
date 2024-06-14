import { Dispatch, SetStateAction, createContext } from 'react'

type MyContextProps = {
  greekChapter: string
  portugueseChapter: string
  bookPage: number
  currentBookIndex: number
  setBookPage: Dispatch<SetStateAction<number>>
  setCurrentBookIndex: Dispatch<SetStateAction<number>>
  portugueseBooksNames: string[]
  currentBookName: string
  setCurrentBookName: Dispatch<SetStateAction<string>>
}

const MyContext = createContext({} as MyContextProps)

export default MyContext

import { Dispatch, SetStateAction, createContext } from "react";

type MyContextProps = {
    greekChapter: number;
    setGreekChapter: Dispatch<SetStateAction<number>>;
    portugueseBooksNames: string[];
    greekCurrentBook: {
        name: string;
        chapters: (string[] | null)[];
    };
    bookPage: number;
    currentBookIndex: number;
    setBookPage: Dispatch<SetStateAction<number>>;
    setCurrentBookIndex: Dispatch<SetStateAction<number>>;
    currentBookName: string;
    setCurrentBookName: Dispatch<SetStateAction<string>>;
    setLang: Dispatch<SetStateAction<"PT" | "EN">>;
    lang: "PT" | "EN";
};

const MyContext = createContext({} as MyContextProps);

export default MyContext;

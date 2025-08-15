import React, { ReactNode, useEffect, useMemo, useState } from "react";
import MyContext from "./items-context";
import { portuguese } from "../config/septuagint-versions/portuguese-version";
import { greek } from "../config/septuagint-versions/greek-version";
import { booksStrategy } from "../config/septuagint-versions/books-order";

type MyProviderProps = {
    children: ReactNode;
};

export const MyProvider = ({ children }: MyProviderProps) => {
    const [bookPage, setBookPage] = useState(1);
    const [lang, setLang] = useState<"PT" | "EN">("PT");
    const booksNames = booksStrategy.map((book) => book[lang]);
    const [currentBookIndex, setCurrentBookIndex] = useState(0);
    const [greekChapter, setGreekChapter] = useState(1);
    const [currentBookName, setCurrentBookName] = useState(
        booksNames[currentBookIndex],
    );

    const greekCurrentBook = greek[currentBookIndex];

    return (
        <MyContext.Provider
            value={{
                greekChapter,
                setGreekChapter,
                bookPage,
                currentBookIndex,
                setBookPage,
                setCurrentBookIndex,
                greekCurrentBook,
                portugueseBooksNames: booksNames,
                currentBookName,
                lang,
                setLang,
                setCurrentBookName,
            }}
        >
            {children}
        </MyContext.Provider>
    );
};

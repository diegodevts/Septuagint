import {
    BackHandler,
    Dimensions,
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    PermissionsAndroid,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import React, { useCallback } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import MyContext from "@/src/contexts/items-context";
import {
    normalizeBookName,
    capitalizeFirstLetter
} from "@/src/utils/capitalize";
import { Toast } from "toastify-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import { morphology } from "@/src/config/morphology/lxx_morphology";
import {
    RouteProp,
    useFocusEffect,
    useNavigation,
    useRoute
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/@types/types";
import { removeGreekAccents } from "@/src/utils/remove-accents";
import { greek } from "@/src/config/septuagint-versions/greek-version";
import { useVoice, VoiceMode } from "react-native-voicekit";

const { width } = Dimensions.get("screen");

export type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Bible" | "Biblia"
>;
type BibleRouteProp = RouteProp<RootStackParamList, "Bible" | "Biblia">;

export const Bible = () => {
    const route = useRoute<BibleRouteProp>();
    const {
        chapterToScroll = null,
        verseToScroll = null,
        bookToScroll = null,
        fromSearch
    } = route.params ?? {};

    const navigation = useNavigation<NavigationProp>();
    const {
        greekChapter,
        greekCurrentBook,
        setGreekChapter,
        setCurrentBookIndex,
        setBookPage,
        portugueseBooksNames,
        bookPage,
        currentBookName,
        lang,
        popupVisible,
        setPopupVisible,
        verse,
        setVerse,
        setGreekCurrentBook
    } = useContext(MyContext);

    const [versePositions, setVersePositions] = useState<any>({});
    const { available, listening, transcript, startListening, stopListening } =
        useVoice({
            locale: "pt-BR",
            mode: VoiceMode.Continuous,
            enablePartialResults: true
        });

    const [isSearchButtonVisible, setSearchButtonVisible] =
        useState<boolean>(true);
    const [isCopyButtonVisible, setCopyButtonVisible] =
        useState<boolean>(false);
    const scrollRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();
    const currentChapter = greekCurrentBook.chapters[greekChapter - 1];
    const [backgroundVerseColor, setBackgroundVerseColor] = useState("#fff");
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [selectedWord, setSelectedWord] = useState<{
        word: string;
        pos: string;
        lemma: string;
    }>(null);
    const [wordWidth, setWordWidth] = useState(0);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (fromSearch) {
                    if (navigation.canGoBack()) {
                        navigation.goBack();
                    } else {
                        navigation.navigate(
                            lang == "PT" ? "Pesquisa" : "Search"
                        );
                    }
                    return true;
                }
                return false;
            };

            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress
            );

            return () => subscription.remove();
        }, [fromSearch])
    );

    useEffect(() => {
        if (chapterToScroll && verseToScroll && bookToScroll) {
            const hasBookToScroll = greek.find((book, index) => {
                if (book.name === bookToScroll) {
                    setCurrentBookIndex(index);
                    return true;
                }
                return false;
            });

            setBookPage(chapterToScroll);
            setGreekCurrentBook(hasBookToScroll);
            setGreekChapter(chapterToScroll);
            setVerse(verseToScroll);
        }
    }, [chapterToScroll, verseToScroll, bookToScroll]);

    useEffect(() => {
        if (bookPage) {
            setGreekChapter(bookPage);
        }
    }, [bookPage]);

    const handleVerseLayout = (index: number, event: LayoutChangeEvent) => {
        const { y } = event.nativeEvent.layout;
        setVersePositions((prevPositions: any) => ({
            ...prevPositions,
            [index]: y
        }));
    };

    const scrollToVerse = (chapter: number, verse: number) => {
        const position = versePositions[verse - 1];
        if (position !== undefined && scrollRef.current) {
            scrollRef.current.scrollTo({ y: position });
        }
    };

    useEffect(() => {
        if (!greekChapter || !versePositions) return;

        if (verse && versePositions[verse - 1] !== undefined) {
            scrollToVerse(bookPage, verse);
        } else if (versePositions[0] !== undefined) {
            scrollRef.current?.scrollTo({ y: versePositions[0] });
        }
    }, [versePositions, verse, greekChapter]);

    useEffect(() => {
        (() => {
            if (transcript && transcript.length > 0) {
                const formattedResults = transcript.split(" ");

                if (
                    formattedResults.length == 2 &&
                    formattedResults.includes("verso") &&
                    !isNaN(+formattedResults[1])
                ) {
                    setVerse(+formattedResults[1]);
                    return;
                }

                const hasVerse =
                    formattedResults.indexOf("verso") != -1
                        ? formattedResults.indexOf("verso") - 1
                        : formattedResults.length - 1;

                let book = capitalizeFirstLetter(
                    formattedResults
                        .slice(0, hasVerse)
                        .toString()
                        .split(",")
                        .join(" ")
                );
                const chapter = formattedResults[hasVerse];

                if (book.includes("Primeira")) {
                    book = book.replace(/Primeira/i, "1");
                }

                if (book.includes("Segunda")) {
                    book = book.replace(/Segunda/i, "2");
                }

                const currentBookIndex = normalizeBookName(
                    portugueseBooksNames,
                    book
                );

                if (currentBookIndex != -1 && !isNaN(+chapter)) {
                    setCurrentBookIndex(currentBookIndex);
                    setBookPage(+chapter);

                    if (formattedResults.includes("verso")) {
                        setVerse(
                            +formattedResults[formattedResults.length - 1]
                        );
                    } else {
                        setVerse(1);
                    }
                    return;
                }

                Toast.error(`Não existe um livro chamado ${book}`, "top");
            }
        })();
    }, [transcript]);

    const [selectedVerses, setSelectedVerses] = useState<
        { index: number; text: string }[]
    >([]);

    const wordRefs = useRef<{ [key: string]: View | null }>({});
    const handleText = (
        index: number,
        text: string,
        event: "press" | "longpress"
    ) => {
        const isSelected = selectedVerses.find(
            (verse) => verse.index === index
        );

        if (isSelected && selectedVerses.length === 1) {
            setSelectedVerses([]);
            setBackgroundVerseColor("#fff");
            setCopyButtonVisible(false);
            return;
        }

        if (isSelected) {
            const updated = selectedVerses.filter((v) => v.index !== index);
            setSelectedVerses(updated);
            setCopyButtonVisible(true);
            return;
        }

        const updated = [...selectedVerses, { index, text }];
        setSelectedVerses(updated);
        setBackgroundVerseColor("#f0f0f0");
        setCopyButtonVisible(true);
    };

    const copyText = async () => {
        try {
            await Clipboard.setStringAsync(
                `${currentBookName} ${greekChapter}\n\n${selectedVerses
                    .slice()
                    .sort((a, b) => a.index - b.index)
                    .map(({ text, index }) => `${index + 1}: ${text}`)
                    .join("\n")}`
            );
            setCopyButtonVisible(false);
            setSelectedVerses([]);
            setBackgroundVerseColor("#fff");
        } catch (err) {
            console.error(`Erro ao copiar`, err);
        }
    };

    const handleMorphology = (wordKey: string, word: string) => {
        const wordRef = wordRefs.current[wordKey];
        if (wordRef) {
            wordRef.measure((x, y, width, height, pageX, pageY) => {
                setPopupPosition({
                    x: pageX,
                    y: pageY
                });
                setWordWidth(width);
                setPopupVisible(true);
            });

            const getMorphology = morphology.find(
                (data) =>
                    data.word.toLowerCase().trim() ===
                        word.toLowerCase().trim() ||
                    removeGreekAccents(data.word.toLowerCase().trim()) ==
                        removeGreekAccents(word.toLowerCase().trim())
            );

            if (getMorphology) {
                const pos = [
                    ...new Set(getMorphology.pos[lang].split(" "))
                ].join(" ");
                setSelectedWord({
                    word,
                    pos,
                    lemma: getMorphology.lemma
                });
            }
        }
    };

    return (
        <Pressable
            style={{ flex: 1 }}
            onPress={() => setSearchButtonVisible((prevState) => !prevState)}
        >
            <View
                style={{
                    flex: 1,
                    padding: 5,
                    paddingBottom: insets.bottom + 60
                }}
            >
                <ScrollView
                    ref={scrollRef}
                    scrollEventThrottle={100}
                    style={{ flex: 1 }}
                >
                    {currentChapter?.map((a, index) => (
                        <TouchableWithoutFeedback
                            key={`verse_${index}`}
                            onPress={() => handleText(index, a, "press")}
                            onLongPress={() =>
                                handleText(index, a, "longpress")
                            }
                        >
                            <View
                                onLayout={(e) => handleVerseLayout(index, e)}
                                style={{
                                    backgroundColor: selectedVerses.find(
                                        (verse) => verse.index === index
                                    )
                                        ? "#f0f0f0"
                                        : "#fff",
                                    paddingVertical: 4,
                                    flexDirection: "row",
                                    alignItems: "flex-start"
                                }}
                            >
                                <Text
                                    style={{
                                        fontWeight: "bold",
                                        fontSize: 16,
                                        marginRight: 6,
                                        marginTop: 2
                                    }}
                                >
                                    {index + 1}
                                </Text>

                                <View
                                    style={{
                                        flexDirection: "row",
                                        flexWrap: "wrap",
                                        flexShrink: 1,
                                        flex: 1
                                    }}
                                >
                                    {a
                                        .trim()
                                        .split(" ")
                                        .map((word, wordIndex) => {
                                            const wordKey = `${index}_${wordIndex}`;
                                            const isSelected =
                                                selectedWord?.word === word;

                                            return (
                                                <View
                                                    key={wordKey}
                                                    pointerEvents={
                                                        isCopyButtonVisible
                                                            ? "none"
                                                            : "auto"
                                                    }
                                                >
                                                    <TouchableOpacity
                                                        ref={(ref) => {
                                                            wordRefs.current[
                                                                wordKey
                                                            ] = ref;
                                                        }}
                                                        onPress={() =>
                                                            handleMorphology(
                                                                wordKey,
                                                                word
                                                            )
                                                        }
                                                        activeOpacity={0.6}
                                                    >
                                                        <Text
                                                            style={styles.text}
                                                            onLayout={(e) => {
                                                                if (
                                                                    isSelected
                                                                ) {
                                                                    setWordWidth(
                                                                        e
                                                                            .nativeEvent
                                                                            .layout
                                                                            .width
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            {word}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })}
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    ))}
                </ScrollView>
            </View>

            {/* BOTÃO MICROFONE */}
            <TouchableOpacity
                style={{
                    display: isSearchButtonVisible ? "flex" : "none",
                    height: 50,
                    width: 50,
                    borderRadius: 25,
                    position: "absolute",
                    bottom: insets.bottom + 3,
                    alignSelf: "center",
                    zIndex: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: !listening ? "#218B52" : "red"
                }}
                onPress={
                    available && listening ? stopListening : startListening
                }
            >
                <Icon
                    name={listening ? "stop" : "microphone"}
                    size={20}
                    color="#fff"
                />
            </TouchableOpacity>

            {/* BOTÃO COPIAR */}
            <TouchableOpacity
                style={{
                    display: isCopyButtonVisible ? "flex" : "none",
                    height: 50,
                    width: 50,
                    borderRadius: 25,
                    position: "absolute",
                    bottom: insets.bottom + 3,
                    left: width / 4.8,
                    zIndex: isCopyButtonVisible ? 100 : 1,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#313131"
                }}
                onPress={copyText}
            >
                <Icon name="copy" size={20} color="#fff" />
            </TouchableOpacity>

            {popupVisible && selectedWord && (
                <Pressable
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 998
                    }}
                    onPress={() => setPopupVisible(false)}
                >
                    <View
                        style={{
                            position: "absolute",
                            top: Math.min(
                                popupPosition.y - 60,
                                require("react-native").Dimensions.get("window")
                                    .height -
                                    insets.bottom -
                                    60 * 5
                            ),
                            left: Math.max(
                                8,
                                Math.min(
                                    width - 220 - 8,
                                    popupPosition.x - wordWidth / 2
                                )
                            ),
                            backgroundColor: "#fff",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: "#ccc",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            zIndex: 999,
                            elevation: 5,
                            minWidth: 80,
                            maxWidth: 220,
                            alignItems: "center"
                        }}
                    >
                        <View
                            style={{
                                position: "absolute",
                                bottom: -8,
                                left: "50%",
                                marginLeft: -8,
                                width: 0,
                                height: 0,
                                borderLeftWidth: 8,
                                borderRightWidth: 8,
                                borderBottomWidth: 8,
                                borderLeftColor: "transparent",
                                borderRightColor: "transparent",
                                borderBottomColor: "#fff"
                            }}
                        />
                        <Text
                            style={{
                                fontSize: 14,
                                textAlign: "center",
                                marginBottom: 6
                            }}
                        >
                            {`${selectedWord.word}\n\n${selectedWord.pos}`}
                        </Text>
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate("Lexicon", {
                                    wordSearch: selectedWord,
                                    lang
                                })
                            }
                            style={{
                                backgroundColor: "#313131",
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 5
                            }}
                        >
                            <Text
                                style={{
                                    color: "#fff",
                                    fontWeight: "bold"
                                }}
                            >
                                {lang == "PT"
                                    ? "Ver no léxico"
                                    : "See in lexicon"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    text: {
        fontFamily: "Poppins-Regular",
        fontSize: 16,
        marginRight: 4,
        marginBottom: 4
    }
});

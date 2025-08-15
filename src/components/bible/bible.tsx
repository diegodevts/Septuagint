import {
    Dimensions,
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    PermissionsAndroid,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import React, { SyntheticEvent } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import MyContext from "@/src/contexts/items-context";
import Voice, {
    SpeechErrorEvent,
    SpeechResultsEvent
} from "@react-native-voice/voice";
import {
    normalizeBookName,
    capitalizeFirstLetter
} from "@/src/utils/capitalize";
import { Toast } from "toastify-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import { morphology } from "@/src/config/morphology/lxx_morphology";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/@types/types";
import { removeGreekAccents } from "@/src/utils/remove-accents";

const height = Dimensions.get("screen").height;
const width = Dimensions.get("screen").width;

type BibleNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Bible"
>;
export const Bible = () => {
    const navigation = useNavigation<BibleNavigationProp>();
    const {
        greekChapter,
        greekCurrentBook,
        setGreekChapter,
        setCurrentBookIndex,
        setBookPage,
        portugueseBooksNames,
        bookPage,
        currentBookName,
        lang
    } = useContext(MyContext);
    const [voiceMode, setVoiceMode] = useState(false);
    const [voiceResults, setVoiceResults] = useState<string[] | undefined>([]);
    const [verse, setVerse] = useState(0);
    const [versePositions, setVersePositions] = useState<any>({});

    const [isSearchButtonVisible, setSearchButtonVisible] =
        useState<boolean>(true);
    const [isCopyButtonVisible, setCopyButtonVisible] =
        useState<boolean>(false);
    const scrollRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();
    const currentChapter = greekCurrentBook.chapters[greekChapter - 1];
    const [backgroundVerseColor, setBackgroundVerseColor] = useState("#fff");
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [selectedWord, setSelectedWord] = useState<{
        word: string;
        pos: string;
        lemma: string;
    }>(null);
    const [wordWidth, setWordWidth] = useState(0);
    // const handleWordPress = (word: string, event: GestureResponderEvent) => {
    //     const { pageX, pageY } = event.nativeEvent;
    //     setPopupPosition({ x: pageX, y: pageY });
    //     setSelectedWord(word);
    //     setPopupVisible(true);
    // };

    useEffect(() => {
        if (bookPage) {
            setGreekChapter(bookPage);
        }
    }, [bookPage]);
    const onSpeechError = (error: SpeechErrorEvent) => {
        console.log(error);
    };

    const startVoiceMode = async () => {
        await Voice.start("pt-BR");
        setVoiceMode(true);
    };
    const stopVoiceMode = async () => {
        await Voice.stop();
        setVoiceMode(false);
    };

    const requestMicrophonePermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Ok");
            } else {
                console.log("Permission denied");
            }
        } catch (err) {
            console.warn("");
        }
    };

    useMemo(() => {
        requestMicrophonePermission();

        Voice.onSpeechResults = (result: SpeechResultsEvent) => {
            setVoiceResults(result.value);
        };

        Voice.onSpeechError = onSpeechError;

        return () => Voice.destroy().then(Voice.removeAllListeners);
    }, []);

    const handleVerseLayout = (index: number, event: LayoutChangeEvent) => {
        const { y } = event.nativeEvent.layout;
        setVersePositions((prevPositions: any) => ({
            ...prevPositions,
            [index]: y
        }));
    };

    const scrollToVerse = (chapter: number, verse: number) => {
        const position = versePositions[verse];
        if (position !== undefined && scrollRef.current) {
            scrollRef.current.scrollTo({ y: position, animated: true });
        }
    };

    useEffect(() => {
        (() => {
            if (voiceResults && voiceResults.length > 0) {
                const formattedResults = voiceResults[0].split(" ");

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
    }, [voiceResults]);

    useMemo(() => {
        scrollToVerse(bookPage, verse);
    }, [versePositions, verse]);

    const [selectedVerses, setSelectedVerses] = useState<
        { index: number; text: string }[]
    >([]);

    const wordRefs = useRef<{ [key: string]: View | null }>({});
    const handleText = (
        index: number,
        text: string,
        event: "press" | "longpress"
    ) => {
        if (backgroundVerseColor == "#fff" && event == "press") {
            setSearchButtonVisible((prevState) => !prevState);

            return;
        }

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
                    .map(({ text, index }) => `${index + 1}: ${text}`)
                    .join("\n")}`
            );
            setCopyButtonVisible(false);
            setSelectedVerses([]);
            setBackgroundVerseColor("#fff");
        } catch (err) {
            console.error(`Erro ao copiar`);
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
        <View
            style={{
                height: Dimensions.get("window").height - insets.bottom * 2.7,
                padding: 5
            }}
        >
            <ScrollView
                ref={scrollRef}
                scrollEventThrottle={16}
                onScroll={() => setPopupVisible(false)}
            >
                {currentChapter?.map((a, index) => (
                    <TouchableWithoutFeedback
                        key={`verse_${index}`}
                        onPress={() => {
                            handleText(index, a, "press");
                            setPopupVisible(false);
                        }}
                        onLongPress={() => handleText(index, a, "longpress")}
                        style={{
                            backgroundColor: selectedVerses.find(
                                (verse) => verse.index === index
                            )
                                ? "#f0f0f0"
                                : "#fff"
                        }}
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
                                            <TouchableOpacity
                                                key={wordKey}
                                                ref={(ref) => {
                                                    wordRefs.current[wordKey] =
                                                        ref;
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
                                                        if (isSelected) {
                                                            setWordWidth(
                                                                e.nativeEvent
                                                                    .layout
                                                                    .width
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {word}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                ))}
            </ScrollView>

            <TouchableOpacity
                style={{
                    display: isSearchButtonVisible ? "flex" : "none",
                    height: 50,
                    position: "absolute",
                    width: 50,
                    borderRadius: 50,
                    top: height - 200,
                    left: width / 2.4,
                    zIndex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: !voiceMode ? "#218B52" : "red"
                }}
                onPress={!voiceMode ? startVoiceMode : stopVoiceMode}
            >
                <Icon
                    name="microphone"
                    size={20}
                    color="white"
                    style={{
                        color: "#fff",
                        display: !voiceMode ? "flex" : "none"
                    }}
                />

                <Icon
                    name="stop"
                    size={20}
                    color="#fff"
                    style={{
                        display: voiceMode ? "flex" : "none"
                    }}
                />
            </TouchableOpacity>
            <TouchableOpacity
                style={{
                    display: isCopyButtonVisible ? "flex" : "none",
                    height: 50,
                    position: "absolute",
                    width: 50,
                    borderRadius: 50,
                    top: height - 200,
                    left: width / 4.8,
                    zIndex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#313131"
                }}
                onPress={copyText}
            >
                <Icon
                    name="copy"
                    size={20}
                    color="white"
                    style={{
                        color: "#fff"
                    }}
                />
            </TouchableOpacity>
            {popupVisible && selectedWord && (
                <View
                    style={{
                        position: "absolute",
                        top: Math.min(
                            popupPosition.y - 60,
                            // limita para não ultrapassar a barra inferior
                            // 20 é um padding extra opcional
                            // insets.bottom dá a altura da barra de ações/navegação
                            // Dimensions.get('window').height é a altura da tela
                            // mas se vc não quer que encoste no bottom, subtraia insets.bottom + margem
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
                    {/* Seta para cima */}
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
                                wordSearch: selectedWord
                            })
                        }
                        style={{
                            backgroundColor: "#313131",
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 5
                        }}
                    >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                            {lang == "PT"
                                ? "Ver no dicionário"
                                : "See in dictionary"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    column: {
        flex: 1,
        width: "100%",
        flexDirection: "row",
        height: "100%"
    },
    caretLeft: {
        position: "absolute",
        top: height - 200,
        right: width - 50
    },
    caretRight: {
        position: "absolute",
        top: height - 200,
        left: width - 50
    },
    container: {
        display: "flex",
        width: "100%",
        height: "100%",
        padding: 3
    },
    text: {
        fontFamily: "Poppins-Regular",
        fontSize: 16,
        marginRight: 4,
        marginBottom: 4
    },
    pdf: {
        flex: 1,
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height
    }
});

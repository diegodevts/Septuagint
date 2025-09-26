import { strong } from "@/src/config/dictionaries/strong";
import { morphology } from "@/src/config/morphology/lxx_morphology";
import { greek } from "@/src/config/septuagint-versions/greek-version";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";
import {
    Dimensions,
    FlatList,
    InteractionManager,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome5";
import { NavigationProp } from "../bible/bible";
import MyContext from "@/src/contexts/items-context";
import Loading from "../loading/loading";

type SearchResult = {
    book: string;
    chapterIndex: number;
    verseIndex: number;
    verse: string;
};

export const Search = () => {
    const navigation = useNavigation<NavigationProp>();
    const width = Dimensions.get("screen").width;
    const [word, setWord] = useState("");
    const [isFragment, setIsFragment] = useState(false);
    const [searchMode, setSearchMode] = useState("word");
    const [searchWord, setSearchWord] = useState("");
    const [wordsWithSameLemma, setWordsWithSameLemma] = useState<string[]>([]);
    const [occurrences, setOcurrences] = useState(0);
    const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const toggleSwitch = () => setIsFragment((previousState) => !previousState);
    const { lang } = useContext(MyContext);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (!searchWord) return;

        setIsLoading(true);

        setTimeout(() => {
            let results: SearchResult[] = [];

            if (searchMode === "word") {
                results = searchWordInBooks(searchWord, greek);
            } else if (searchMode === "lemma") {
                results = searchLemma(searchWord, greek);
            }

            setFilteredResults(results);
            setOcurrences(results.length);
            setIsLoading(false);
        }, 100);
    }, [searchWord, searchMode, isFragment, wordsWithSameLemma]);

    const setTextToScroll = (data: {
        book: string;
        chapter: number;
        verse: number;
    }) => {
        navigation.navigate(lang == "PT" ? "Biblia" : "Bible", {
            bookToScroll: data.book,
            chapterToScroll: data.chapter,
            verseToScroll: data.verse,
            fromSearch: true
        });
    };

    const removeGreekAccents = (text: string) =>
        text
            .normalize("NFD")
            .replace(/[\u0300-\u036f\u1FBD\u1FFE\u0345]/g, "")
            .normalize("NFC");

    const highlightWord = (verse: string, word: string) => {
        if (!word) return <Text style={styles.title}>{verse}</Text>;
        const cleanWord = removeGreekAccents(word);

        if (isFragment) {
            const regex = new RegExp(`(${cleanWord})`, "gi");
            const parts = removeGreekAccents(verse).split(regex);
            return (
                <Text style={styles.title}>
                    {parts.map((part, index) => {
                        if (
                            removeGreekAccents(part.toLowerCase()) ===
                            cleanWord.toLowerCase()
                        ) {
                            return (
                                <Text
                                    key={index}
                                    style={{ color: "red", fontSize: 16 }}
                                >
                                    {part}
                                </Text>
                            );
                        }
                        return <Text key={index}>{part}</Text>;
                    })}
                </Text>
            );
        }

        const parts = verse?.split(" ");
        return (
            <Text style={styles.title}>
                {parts &&
                    parts.map((part, index) => {
                        if (
                            removeGreekAccents(part.toLowerCase()) ===
                            cleanWord.toLowerCase()
                        ) {
                            return (
                                <Text
                                    key={index}
                                    style={{ color: "red", fontSize: 16 }}
                                >
                                    {part + " "}
                                </Text>
                            );
                        }
                        return <Text key={index}>{part + " "}</Text>;
                    })}
            </Text>
        );
    };

    const highlightLemma = (verse: string, words: string[]) => {
        if (!words || words.length === 0)
            return <Text style={styles.title}>{verse}</Text>;

        const parts = verse?.split(" ");
        return (
            <Text style={styles.title}>
                {parts?.map((part, index) => {
                    const cleanPart = removeGreekAccents(part.toLowerCase());
                    const isLemma = words.includes(cleanPart);

                    return (
                        <Text
                            key={index}
                            style={{
                                color: isLemma ? "red" : "#fff",
                                fontSize: 16
                            }}
                        >
                            {part + " "}
                        </Text>
                    );
                })}
            </Text>
        );
    };

    const renderItem = useCallback(
        ({ item }) => (
            <TouchableOpacity
                style={styles.item}
                onPress={() =>
                    setTextToScroll({
                        book: item.book,
                        chapter: item.chapterIndex,
                        verse: item.verseIndex
                    })
                }
            >
                <Text
                    style={styles.title}
                    numberOfLines={0}
                    ellipsizeMode="tail"
                >
                    {`${item.book} ${item.chapterIndex}:${item.verseIndex}: `}
                    {searchMode == "word"
                        ? highlightWord(item.verse, word)
                        : highlightLemma(item.verse, wordsWithSameLemma)}
                </Text>
            </TouchableOpacity>
        ),
        [word, searchWord]
    );

    const searchWordInBooks = (
        word: string,
        books: { name: string; chapters: string[][] }[]
    ): SearchResult[] => {
        const results: SearchResult[] = [];
        if (!word) return results;

        const regex = new RegExp(removeGreekAccents(word.toLowerCase()), "i");

        books.forEach((book) => {
            book.chapters?.forEach((chapter, chapterIndex) => {
                chapter?.forEach((verse, verseIndex) => {
                    if (!isFragment) {
                        verse.split(" ").forEach((_word) => {
                            if (
                                removeGreekAccents(_word.toLowerCase()) ===
                                removeGreekAccents(word.toLowerCase())
                            ) {
                                results.push({
                                    book: book.name,
                                    chapterIndex: chapterIndex + 1,
                                    verseIndex: verseIndex + 1,
                                    verse
                                });
                                return;
                            }
                        });
                    }
                    if (
                        isFragment &&
                        regex.test(removeGreekAccents(verse.toLowerCase()))
                    ) {
                        results.push({
                            book: book.name,
                            chapterIndex: chapterIndex + 1,
                            verseIndex: verseIndex + 1,
                            verse
                        });
                    }
                });
            });
        });

        setOcurrences(results.length);
        return results;
    };

    const searchLemma = (
        word: string,
        books: { name: string; chapters: string[][] }[]
    ) => {
        const results: SearchResult[] = [];
        if (!word) return results;

        books.forEach((book) => {
            book.chapters?.forEach((chapter, chapterIndex) => {
                chapter?.forEach((verse, verseIndex) => {
                    verse.split(" ").forEach((_word) => {
                        if (
                            wordsWithSameLemma.includes(
                                removeGreekAccents(_word.toLowerCase())
                            )
                        ) {
                            results.push({
                                book: book.name,
                                chapterIndex: chapterIndex + 1,
                                verseIndex: verseIndex + 1,
                                verse
                            });
                            return;
                        }
                    });
                });
            });
        });

        setOcurrences(results.length);
        return results;
    };

    const setWordAndWordsLemmas = () => {
        if (word.trim() !== "") {
            setSearchWord(word);
            const getMorphology = morphology.find(
                (data) =>
                    data.word.toLowerCase().trim() ===
                        word.toLowerCase().trim() ||
                    removeGreekAccents(data.word.toLowerCase().trim()) ===
                        removeGreekAccents(word.toLowerCase().trim())
            );

            if (getMorphology) {
                const lemma = removeGreekAccents(
                    getMorphology.lemma.toLowerCase()
                );
                const wordsLemmas = morphology
                    .filter(
                        (data) =>
                            removeGreekAccents(data.lemma.toLowerCase()) ===
                            lemma
                    )
                    .map(({ word }) => removeGreekAccents(word.toLowerCase()));
                setWordsWithSameLemma(wordsLemmas);
            } else {
                setWordsWithSameLemma([]);
            }
        }
    };

    /** COMPONENTE HEADER */
    const header = (
        <View style={{ alignItems: "center", paddingTop: 10 }}>
            {/* Botões de busca */}
            <View style={{ flexDirection: "row", marginTop: 10 }}>
                <TouchableOpacity
                    style={{
                        height: 50,
                        width: width / 2 - 10,
                        borderRadius: 10,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor:
                            searchMode === "word" ? "#313131" : "#fff",
                        borderWidth: searchMode === "word" ? 0 : 2,
                        borderColor: "#313131"
                    }}
                    onPress={() => {
                        setSearchMode("word");
                        setWord("");
                        setSearchWord("");
                        setWordsWithSameLemma([]);
                        setFilteredResults([]);
                        setOcurrences(0);
                    }}
                >
                    <Icon
                        name="search"
                        size={20}
                        color={searchMode === "word" ? "#fff" : "#313131"}
                    />
                    <Text
                        style={{
                            color: searchMode === "word" ? "#fff" : "#313131",
                            fontSize: 12
                        }}
                    >
                        Busca por palavra
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        height: 50,
                        width: width / 2 - 10,
                        borderRadius: 10,
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 10,
                        backgroundColor:
                            searchMode === "lemma" ? "#313131" : "#fff",
                        borderWidth: searchMode === "lemma" ? 0 : 2,
                        borderColor: "#313131"
                    }}
                    onPress={() => {
                        setSearchMode("lemma");
                        setWord("");
                        setSearchWord("");
                        setWordsWithSameLemma([]);
                        setFilteredResults([]);
                        setOcurrences(0);
                    }}
                >
                    <Icon
                        name="book-open"
                        size={20}
                        color={searchMode === "lemma" ? "#fff" : "#313131"}
                    />
                    <Text
                        style={{
                            color: searchMode === "lemma" ? "#fff" : "#313131",
                            fontSize: 12
                        }}
                    >
                        Busca por lema
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Input */}
            <View
                style={{
                    flexDirection: "column",
                    gap: 3,
                    marginTop: 15,
                    marginBottom: 15,
                    width: "100%",
                    alignItems: "center"
                }}
            >
                <TextInput
                    style={{
                        color: "#313131",
                        borderColor: "#313131",
                        fontFamily: "Poppins-Regular",
                        borderWidth: 1,
                        borderRadius: 10,
                        fontSize: 15,
                        height: 45,
                        paddingHorizontal: 10,
                        width: Dimensions.get("screen").width - 20,
                        textAlign: "left"
                    }}
                    value={word}
                    placeholder="Digite algo para pesquisar"
                    onSubmitEditing={setWordAndWordsLemmas}
                    onChangeText={setWord}
                />
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 5,
                        gap: 10
                    }}
                >
                    <Text
                        style={{
                            display: searchMode === "word" ? "flex" : "none",
                            color: "#313131",
                            fontSize: 15,
                            fontFamily: "Poppins-Regular"
                        }}
                    >
                        Buscar por fragmentos
                    </Text>
                    <Switch
                        style={{
                            display: searchMode === "word" ? "flex" : "none"
                        }}
                        trackColor={{ false: "#767577", true: "#f4f3f4" }}
                        thumbColor={isFragment ? "#767577" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSwitch}
                        value={isFragment}
                    />
                    <Text
                        style={{
                            color: "#313131",
                            fontSize: 15,
                            fontFamily: "Poppins-Regular",
                            fontWeight: "bold"
                        }}
                    >
                        {`Ocorrências: ${occurrences}`}
                    </Text>
                </View>
            </View>
        </View>
    );
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            {!isLoading ? (
                <FlatList
                    data={filteredResults}
                    renderItem={renderItem}
                    keyExtractor={(_, i) => i.toString()}
                    ListHeaderComponent={header}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                        paddingBottom: insets.bottom,
                        alignItems: "center"
                    }}
                />
            ) : (
                <Loading isLoading={isLoading} />
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    item: {
        backgroundColor: "#313131",
        padding: 15,
        marginVertical: 2,
        borderRadius: 8,
        width: Dimensions.get("screen").width - 20
    },
    title: {
        color: "#fff",
        fontSize: 16
    }
});

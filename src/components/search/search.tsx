import { strong } from "@/src/config/dictionaries/strong";
import { greek } from "@/src/config/septuagint-versions/greek-version";
import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import React, {
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome5";

type SearchResult = {
    book: string;
    chapterIndex: number;
    verseIndex: number;
    verse: string;
};

export const Search = () => {
    const width = Dimensions.get("screen").width;
    const [word, setWord] = useState("");
    const [isFragment, setIsFragment] = useState(false);
    const [searchMode, setSearchMode] = useState("word");
    const [searchWord, setSearchWord] = useState("");
    const toggleSwitch = () => setIsFragment((previousState) => !previousState);

    const removeGreekAccents = (text: string) =>
        text
            .normalize("NFD")
            .replace(/[\u0300-\u036f\u1FBD\u1FFE\u0345]/g, "")
            .normalize("NFC");

    const highlightWord = (verse: string, word: string) => {
        if (!word) return <Text style={styles.title}>{verse}</Text>;

        // Remove acentos da palavra pesquisada
        const cleanWord = removeGreekAccents(word);

        // Quando busca por fragmento
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
                                    id={`frag-${index}`}
                                    style={{ color: "red", fontSize: 16 }}
                                >
                                    {part}
                                </Text>
                            );
                        }
                        return <Text id={`frag-${index}`}>{part}</Text>;
                    })}
                </Text>
            );
        }

        // Quando busca por palavra exata
        const parts = verse.split(" ");
        return (
            <Text style={styles.title}>
                {parts.map((part, index) => {
                    if (
                        removeGreekAccents(part.toLowerCase()) ===
                        cleanWord.toLowerCase()
                    ) {
                        return (
                            <Text
                                id={`word-${index}`}
                                style={{ color: "red", fontSize: 16 }}
                            >
                                {part + " "}
                            </Text>
                        );
                    }
                    return <Text id={`word-${index}`}>{part + " "}</Text>;
                })}
            </Text>
        );
    };
    const renderItem = useCallback(
        ({ item }) => (
            <View style={styles.item}>
                <Text
                    style={styles.title}
                    numberOfLines={0}
                    ellipsizeMode="tail"
                >
                    {`${item.book} ${item.chapterIndex}:${item.verseIndex}: `}
                    {highlightWord(item.verse, word)}
                </Text>
            </View>
        ),
        [word]
    );

    const insets = useSafeAreaInsets();

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

        return results;
    };

    const searchLemma = (
        word: string,
        books: { name: string; chapters: string[][] }[]
    ) => {
        //1. pesquiso a palavra digitada na morfologia.
        // 2. vejo as palavras que tem aquele lemma na morfologia.
        // 3. procuro aquelas palavras na bíblia
    };

    // Uso
    const filteredResults =
        searchMode == "word" ? searchWordInBooks(searchWord, greek) : ""; //searchLemma(searchWord, greek); implementar dps

    return (
        <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
            <View
                style={{
                    flexDirection: "row",
                    marginTop: 10,
                    flex: 1
                }}
            >
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
                    onPress={() => setSearchMode("word")}
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

                {/* Botão Busca por Lemma */}
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
                    onPress={() => setSearchMode("lemma")}
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
            <View
                style={{
                    flexDirection: "column",
                    gap: 3,
                    flex: 1,
                    marginBottom: 15
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
                    onEndEditing={() => setSearchWord(word)}
                    onChangeText={setWord}
                />
                <KeyboardAvoidingView
                    style={{
                        flex: 1,
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        marginTop: 5
                    }}
                >
                    <Text
                        style={{
                            color: "#313131",
                            fontSize: 15,
                            fontFamily: "Poppins-Regular"
                        }}
                    >
                        {"Buscar por fragmentos"}
                    </Text>
                    <Switch
                        style={{ marginLeft: 10 }}
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
                        {`Ocorrências: ${filteredResults.length}`}
                    </Text>
                </KeyboardAvoidingView>
            </View>
            <View
                style={{
                    justifyContent: "flex-start",
                    height: Dimensions.get("screen").height * 0.6,
                    marginBottom: insets.bottom + 7
                }}
            >
                <FlatList
                    style={{
                        flex: 1,
                        borderRadius: 8
                    }}
                    data={filteredResults}
                    renderItem={renderItem}
                    keyExtractor={(item, index) =>
                        item["#"] ?? index.toString()
                    }
                />
            </View>
        </View>
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

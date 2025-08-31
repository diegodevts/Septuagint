import { strong } from "@/src/config/dictionaries/strong";
import { greek } from "@/src/config/septuagint-versions/greek-version";
import { useEffect, useState } from "react";
import React, {
    Dimensions,
    FlatList,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SearchResult = {
    book: string;
    chapterIndex: number;
    verseIndex: number;
    verse: string;
};

export const Search = () => {
    const [word, setWord] = useState("");
    const [isEnabled, setIsEnabled] = useState(false);

    const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

    const removeGreekAccents = (text: string) =>
        text
            .normalize("NFD")
            .replace(/[\u0300-\u036f\u1FBD\u1FFE\u0345]/g, "")
            .normalize("NFC");

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.title} numberOfLines={0} ellipsizeMode="tail">
                {`${item.book} ${item.chapterIndex}:${item.verseIndex}: "${item.verse}'`}
            </Text>
        </View>
    );

    const insets = useSafeAreaInsets();

    const searchWordInBooks = (
        word: string,
        books: { name: string; chapters: string[][] }[]
    ): SearchResult[] => {
        const results: SearchResult[] = [];
        if (!word) return results;

        const regex = new RegExp(removeGreekAccents(word), "i");

        books.forEach((book) => {
            book.chapters?.forEach((chapter, chapterIndex) => {
                chapter?.forEach((verse, verseIndex) => {
                    if (regex.test(removeGreekAccents(verse))) {
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

    // Uso
    const filteredResults = searchWordInBooks(word, greek);

    return (
        <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
            <View
                style={{
                    flexDirection: "column",
                    gap: 3,
                    marginTop: 10,
                    flex: 1
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
                    onChangeText={setWord}
                />
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "flex-start"
                    }}
                >
                    <Text
                        style={{
                            color: "#313131",
                            marginBottom: 10,
                            fontSize: 15
                        }}
                    >
                        {"Buscar por fragmentos"}
                    </Text>
                    <Switch
                        style={{ marginLeft: 10 }}
                        trackColor={{ false: "#767577", true: "#f4f3f4" }}
                        thumbColor={isEnabled ? "#767577" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSwitch}
                        value={isEnabled}
                    />
                </View>
            </View>
            <FlatList
                style={{
                    marginBottom: 60,
                    height: Dimensions.get("screen").height / 1.6
                }}
                data={filteredResults}
                renderItem={renderItem}
                keyExtractor={(item, index) => item["#"] ?? index.toString()}
            />
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

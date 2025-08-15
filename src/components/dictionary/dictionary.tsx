import { strong } from "@/src/config/dictionaries/strong";
import { useState } from "react";
import React, {
    Dimensions,
    FlatList,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const Dictionary = () => {
    const [word, setWord] = useState("");
    const [isEnabled, setIsEnabled] = useState(false);

    const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

    const removeGreekAccents = (text) => {
        if (!text) return "";

        const normalized = text.normalize("NFD");
        const withoutDiacritics = normalized.replace(/[\u0300-\u036f]/g, "");

        return withoutDiacritics
            .replace(/\u1FBD/g, "")
            .replace(/\u1FFE/g, "")
            .replace(/\u0345/g, "")
            .normalize("NFC");
    };

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.title}>{item.Word}</Text>
        </View>
    );
    const insets = useSafeAreaInsets();
    const filteredData = strong.filter((data) => {
        if (isEnabled) {
            return (
                data.Word.toLowerCase().includes(word.toLowerCase()) ||
                removeGreekAccents(data.Word.toLowerCase().trim()).includes(
                    removeGreekAccents(word.toLowerCase().trim()),
                )
            );
        }

        return (
            data.Word.toLowerCase() == word.toLowerCase() ||
            removeGreekAccents(data.Word.toLowerCase().trim()) ==
                removeGreekAccents(word.toLowerCase().trim())
        );
    });

    return (
        <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
            <View
                style={{
                    flexDirection: "column",
                    gap: 3,
                    marginTop: 10,
                    flex: 1,
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
                        textAlign: "left",
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
                        justifyContent: "flex-start",
                    }}
                >
                    <Text
                        style={{
                            color: "#313131",
                            marginBottom: 10,
                            fontSize: 15,
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
                    height: Dimensions.get("screen").height / 1.6,
                }}
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={(item) => item["#"]}
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
        height: 51,
        width: Dimensions.get("screen").width - 20,
    },
    title: {
        color: "#fff",
        fontSize: 16,
    },
});

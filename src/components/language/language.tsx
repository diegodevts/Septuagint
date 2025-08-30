import React, { useState } from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";

export default function LanguageSelector({
    selectedLanguage,
    onSelectLanguage
}) {
    const [showAllFlags, setShowAllFlags] = useState(false);

    const flags = {
        PT: require("../../../assets/flag-brazil.png"),
        EN: require("../../../assets/flag-usa.png")
    };

    const handleFlagPress = (lang) => {
        if (showAllFlags) {
            onSelectLanguage(lang);
            setShowAllFlags(false);
        } else {
            setShowAllFlags(true);
        }
    };

    const renderSingleFlag = () => (
        <TouchableOpacity onPress={() => setShowAllFlags(true)}>
            <Image source={flags[selectedLanguage]} style={styles.flag} />
        </TouchableOpacity>
    );

    const renderAllFlags = () => (
        <View style={styles.flagRow}>
            {Object.keys(flags).map((lang) => (
                <TouchableOpacity
                    key={lang}
                    onPress={() => handleFlagPress(lang)}
                >
                    <Image source={flags[lang]} style={styles.flag} />
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            {showAllFlags ? renderAllFlags() : renderSingleFlag()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginVertical: 15
    },
    flag: {
        width: 35,
        height: 25,
        resizeMode: "contain",
        marginHorizontal: 3
    },
    flagRow: {
        flexDirection: "row",
        justifyContent: "center"
    }
});

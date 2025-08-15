import { Text, View } from "react-native";
import React from "react";
import { RootStackParamList } from "@/src/@types/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { strong } from "@/src/config/dictionaries/strong";
import { removeGreekAccents } from "@/src/utils/remove-accents";

type LexiconRouteProp = RouteProp<RootStackParamList, "Lexicon">;

export const Lexicon = () => {
    const route = useRoute<LexiconRouteProp>();
    const { wordSearch = null } = route.params;

    const wordGloss = strong.find(
        (word) =>
            word.Word.toLowerCase() == wordSearch.lemma.toLowerCase() ||
            removeGreekAccents(word.Word.toLowerCase().trim()) ==
                removeGreekAccents(wordSearch.lemma.toLowerCase().trim()) ||
            removeGreekAccents(
                `${word["R1-Gk"]}${word["R2-Gk"]}`.toLowerCase().trim()
            ) == removeGreekAccents(wordSearch.lemma.toLowerCase().trim()) ||
            removeGreekAccents(
                wordSearch.lemma.toLowerCase().trim().slice(0, -1) + "ν"
            ) === removeGreekAccents(word?.Root?.toLowerCase().trim()) ||
            removeGreekAccents(
                wordSearch.lemma.toLowerCase().trim().slice(0, -1) + "ν"
            ) === removeGreekAccents(word.Word.toLowerCase().trim()) ||
            removeGreekAccents(
                wordSearch.lemma.toLowerCase().trim().slice(0, -1) + "ς"
            ) === removeGreekAccents(word?.Root?.toLowerCase().trim()) ||
            removeGreekAccents(
                wordSearch.lemma.toLowerCase().trim().slice(0, -1) + "ς"
            ) === removeGreekAccents(word.Word.toLowerCase().trim())
    );

    return (
        wordSearch &&
        wordGloss && (
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <Text
                    style={{
                        fontFamily: "Poppins-Regular",
                        fontSize: 30,
                        fontWeight: "bold"
                    }}
                >
                    {wordSearch.word}
                </Text>
                <View
                    style={{
                        alignItems: "flex-start",
                        justifyContent: "center",
                        padding: 10
                    }}
                >
                    <Text
                        style={{
                            fontFamily: "Poppins-Regular",
                            fontSize: 17,
                            fontWeight: "bold"
                        }}
                    >
                        Definição:
                    </Text>
                    <Text
                        style={{
                            fontFamily: "Poppins-Regular",
                            fontSize: 17,
                            textAlign: "left"
                        }}
                    >
                        {wordGloss.Gloss}
                    </Text>
                </View>
            </View>
        )
    );
};

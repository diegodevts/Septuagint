import { Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import { RootStackParamList } from "@/src/@types/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { strong } from "@/src/config/dictionaries/strong";
import { removeGreekAccents } from "@/src/utils/remove-accents";

type LexiconRouteProp = RouteProp<RootStackParamList, "Lexicon">;

export const Lexicon = () => {
    const route = useRoute<LexiconRouteProp>();
    const { wordSearch = null, lang = null } = route.params;
    const clean = (str?: string) =>
        str ? removeGreekAccents(str.toLowerCase().trim()) : "";

    const _word = clean(wordSearch.word);
    const lemma = clean(wordSearch.lemma);

    const wordGloss = // 1. lemma === wordWord
        strong.find((word) => lemma == clean(word.Word)) ||
        // 2. lemma === wordRoot
        strong.find((word) => lemma === clean(word.Root)) ||
        // 3. _word === wordWord || lemma === wordRoot
        strong.find(
            (word) => _word === clean(word.Word) || lemma === clean(word.Root)
        ) ||
        // 4. lemma.slice(0, -1) + "ν"
        strong.find(
            (word) =>
                lemma.slice(0, -1) + "ν" === clean(word.Word) ||
                lemma.slice(0, -1) + "ν" === clean(word.Root)
        ) ||
        // 5. lemma.slice(0, -1) + "ς"
        strong.find(
            (word) =>
                lemma.slice(0, -1) + "ς" === clean(word.Word) ||
                lemma.slice(0, -1) + "ς" === clean(word.Root)
        ) ||
        // 6. R1-Gk + R2-Gk
        strong.find(
            (word) =>
                word["R1-Gk"] &&
                word["R2-Gk"] &&
                clean(`${word["R1-Gk"]}${word["R2-Gk"]}`) === lemma
        ) ||
        // 7. Regex especial pra babilonios
        strong.find((word) => lemma.slice(0, -3) === clean(word.Word));

    return (
        wordSearch && (
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
                        {wordGloss?.Gloss ||
                            (lang === "PT"
                                ? "Não existem entradas Strong para essa palavra em grego. Provavelmente se refere a um nome próprio, ou o nome de algum local em Hebraico."
                                : "There are no Strong's entries for this word in Greek. It probably refers to a proper name, or the name of a place in Hebrew.")}
                    </Text>
                </View>
            </View>
        )
    );
};

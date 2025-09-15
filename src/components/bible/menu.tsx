import { createDrawerNavigator } from "@react-navigation/drawer";
import "react-native-gesture-handler";
import { Bible } from "./bible";
import { Search } from "../search/search";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { FontAwesome6, Entypo, MaterialIcons } from "@expo/vector-icons";
import { useContext, useEffect, useMemo, useState } from "react";
import MyContext from "@/src/contexts/items-context";
import React from "react";
import LanguageSelector from "../../components/language/language";
import { Picker } from "@react-native-picker/picker";
import { Toast } from "toastify-react-native";
const Drawer = createDrawerNavigator();

function CustomDrawerToggleButton({ navigation }: any) {
    return (
        <TouchableOpacity
            style={{ marginLeft: 10, paddingRight: 16 }}
            onPress={() => navigation.toggleDrawer()}
        >
            <MaterialIcons name="menu" size={30} color="#fff" />
        </TouchableOpacity>
    );
}

export const Menu = () => {
    const {
        bookPage,
        currentBookIndex,
        portugueseBooksNames,
        setCurrentBookName,
        currentBookName,
        setCurrentBookIndex,
        setBookPage,
        lang,
        setLang,
        setPopupVisible,
        setVerse,
        verse,
        greekCurrentBook
    } = useContext(MyContext);
    const [inputText, setInputText] = useState(`${bookPage}:${verse}`);
    const handleChangeText = (text: string) => {
        setInputText(text); // atualiza o input sempre
    };

    useEffect(() => {
        setInputText("1:1");
    }, [greekCurrentBook]);

    const handleInputSubmit = () => {
        if (/[^\d:]/.test(inputText)) {
            Toast.error(
                "Não existe capítulo e versículo para o valor informado",
                "top"
            );
            return;
        }
        if (inputText.includes(":")) {
            const [chapter, verseNum] = inputText.split(":").map((v) => +v);
            if (!isNaN(chapter)) {
                setBookPage(chapter);
                if (!isNaN(verseNum)) {
                    setVerse(verseNum);
                }
            }
        } else {
            const num = +inputText;
            if (!isNaN(num)) {
                setBookPage(num);
                setVerse(1);
            }
        }
    };

    useEffect(() => {
        setCurrentBookName(portugueseBooksNames[currentBookIndex]);
    }, [currentBookIndex, portugueseBooksNames, setCurrentBookName]);

    return (
        <Drawer.Navigator
            id={undefined}
            useLegacyImplementation={false}
            initialRouteName="Bible"
            screenOptions={({ navigation }) => ({
                headerLeft: () => (
                    <CustomDrawerToggleButton navigation={navigation} />
                ),
                drawerStyle: {
                    backgroundColor: "#313131",
                    paddingVertical: 20
                },
                drawerActiveBackgroundColor: "#fff",
                drawerInactiveTintColor: "#fff"
            })}
        >
            <Drawer.Screen
                name="Bible"
                component={Bible}
                options={{
                    drawerLabel: ({ focused }) => (
                        <Text style={{ color: focused ? "#313131" : "#fff" }}>
                            Bible
                        </Text>
                    ),
                    drawerIcon: ({ focused }) => (
                        <FontAwesome6
                            color={focused ? "#313131" : "#fff"}
                            name="book-bible"
                        />
                    ),
                    headerTitle: () => (
                        <View
                            style={{
                                flexDirection: "row",
                                gap: 10
                            }}
                        >
                            {/* <Text
                                style={{
                                    color: "#fff",
                                    fontFamily: "Poppins-Regular",
                                    fontSize: 18,
                                    top: 20,
                                }}
                            >
                                {currentBookName}
                            </Text> */}
                            <Picker
                                style={{
                                    color: "#fff",
                                    width: 125,
                                    backgroundColor: "#313131",
                                    height: "100%",
                                    borderColor: "#313131"
                                }}
                                dropdownIconColor="white"
                                selectedValue={currentBookName}
                                onValueChange={
                                    (_, index) => setCurrentBookIndex(index - 1) //
                                }
                            >
                                <Picker.Item
                                    label="Selecione..."
                                    value={undefined}
                                    color="white"
                                    style={{
                                        backgroundColor: "#313131"
                                    }}
                                />
                                {portugueseBooksNames.map((c) => (
                                    <Picker.Item
                                        color="white"
                                        style={{ backgroundColor: "#313131" }}
                                        key={c}
                                        label={c}
                                        value={c}
                                    />
                                ))}
                            </Picker>

                            <TextInput
                                style={{
                                    color: "#fff",
                                    borderRadius: 2,
                                    borderColor: "#fff",
                                    borderBottomWidth: 1,
                                    fontFamily: "Poppins-Regular",
                                    fontSize: 18,
                                    width: 75,
                                    textAlign: "center",
                                    marginBottom: 5
                                }}
                                value={inputText}
                                onChangeText={handleChangeText}
                                onBlur={handleInputSubmit}
                                onFocus={() => setPopupVisible(false)}
                            />
                            <LanguageSelector
                                selectedLanguage={lang}
                                onSelectLanguage={(lang) => setLang(lang)}
                            />
                        </View>
                    )
                }}
            />
            <Drawer.Screen
                options={{
                    drawerLabel: ({ focused }) => (
                        <Text style={{ color: focused ? "#313131" : "#fff" }}>
                            {lang == "PT" ? "Pesquisa" : "Search"}
                        </Text>
                    ),
                    drawerIcon: ({ focused }) => (
                        <Entypo
                            color={focused ? "#313131" : "#fff"}
                            name="magnifying-glass"
                        />
                    )
                }}
                name={lang == "PT" ? "Pesquisa" : "Search"}
                component={Search}
            />
        </Drawer.Navigator>
    );
};

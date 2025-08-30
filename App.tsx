import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Dimensions } from "react-native";
import * as Font from "expo-font";
import { useEffect, useState } from "react";
import { MyProvider } from "./src/contexts/items-provider";
import ToastManager, { Toast } from "toastify-react-native";
import React from "react";
import { Routes } from "./src/Routes";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

export default function App() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        async function loadFonts() {
            await Font.loadAsync({
                "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
                "Poppins-Bold": require("./assets/fonts/Poppins-Bold.ttf")
            });
            setFontsLoaded(true);
        }

        loadFonts();
    }, []);

    if (!fontsLoaded) {
        return <ActivityIndicator size="large" />;
    }

    return (
        <>
            <MyProvider>
                <StatusBar backgroundColor="#313131" />
                <Routes />
            </MyProvider>
            <ToastManager
                width={width - 40}
                height={100}
                textStyle={{ fontSize: 13, fontFamily: "Poppins-Regular" }}
            />
        </>
    );
}

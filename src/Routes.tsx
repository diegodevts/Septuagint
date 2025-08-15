import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Menu } from "./components/bible/menu";
import { Bible } from "./components/bible/bible";
import { Lexicon } from "./components/lexicon/lexicon";
import { RootStackParamList } from "./@types/types";

export const Routes = () => {
    const Stack = createNativeStackNavigator<RootStackParamList>();

    return (
        <NavigationContainer
            theme={{
                ...DefaultTheme,
                dark: true,
                colors: {
                    ...DefaultTheme.colors,
                    background: "#fff",
                    border: "#313131",
                    card: "#313131",
                    notification: "#313131",
                    primary: "#313131",
                    text: "#fff",
                },
                fonts: {
                    regular: {
                        fontFamily: "System",
                        fontWeight: "normal",
                    },
                    medium: {
                        fontFamily: "System",
                        fontWeight: "500",
                    },
                    bold: {
                        fontFamily: "System",
                        fontWeight: "700",
                    },
                    heavy: {
                        fontFamily: "System",
                        fontWeight: "900",
                    },
                },
            }}
        >
            <Stack.Navigator id={undefined}>
                <Stack.Screen
                    name="Menu"
                    component={Menu}
                    options={{ headerTransparent: true, headerShown: false }}
                />
                <Stack.Screen
                    name="Bible"
                    component={Bible}
                    options={{ headerTransparent: true, headerShown: false }}
                />
                <Stack.Screen
                    name="Lexicon"
                    component={Lexicon}
                    options={{ headerTransparent: true, headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Routes;

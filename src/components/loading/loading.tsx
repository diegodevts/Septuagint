import React from "react";
import { View, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Loading({ isLoading }) {
    const insets = useSafeAreaInsets();
    return (
        <View
            style={[
                styles.container,
                { top: Dimensions.get("screen").height / 2 - insets.bottom }
            ]}
        >
            <ActivityIndicator
                size="large"
                color="#313131"
                animating={isLoading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        zIndex: 1000,
        position: "absolute",
        left: Dimensions.get("screen").width / 2.1
    }
});

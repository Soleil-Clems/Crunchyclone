import React from "react"
import { Stack } from "expo-router"

const EpisodeLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="[episodeId]"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    )
}

export default EpisodeLayout;
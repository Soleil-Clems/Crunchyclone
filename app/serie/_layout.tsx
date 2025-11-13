import React from "react"
import { Stack } from "expo-router"

const SerieLayout = () => {
    return (
        <Stack>
            <Stack.Screen
                name="[serieId]"
                options={{
                    headerShown: false,
                }}
            />
          
        </Stack>
    )
}

export default SerieLayout;
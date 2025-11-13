import React from "react"
import { Stack } from "expo-router"

const UserLayout = () => {
    return (
        <Stack>
            <Stack.Screen
                name="[userId]"
                options={{
                    headerShown: false,
                }}
            />
          
        </Stack>
    )
}

export default UserLayout;
import { extendTheme } from "@chakra-ui/react";
import { createBreakpoints } from '@chakra-ui/theme-tools'

const breakpoints = createBreakpoints({
    sm: "320px",
    md: "760px",
    lg: "960px",
    xl: "1290px",
})

export const globalStyles = extendTheme({
    styles: {
        global: {
            "html, body": {
                color: "gray.50",
                backgroundColor: "gray.800",
                height: "100vh",
                backgroundImage: "/wave.svg",
                backgroundRepeat: "no-repeat",
                lineHeight: "tall",
            },
        },
    },
    colors: {
        primary: "#4fb8ff",
        primaryDark: "#1d7dd8",
        bg: "#0099FF",
    },
    fonts: {
        body: "Ubuntu, system-ui, Helvetica, sans-serif",
        heading: "Ubuntu, system-ui, Helvetica, sans-serif",
    },
    breakpoints,
})

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f0f4ff',
                    100: '#e1e9ff',
                    200: '#c3d3ff',
                    300: '#a5bdff',
                    400: '#87a7ff',
                    500: '#6991ff',
                    600: '#5474cc',
                    700: '#3f5799',
                    800: '#2a3a66',
                    900: '#151d33',
                },
                primary: "#1e1e1e",
                background: {
                    light: "#eef7f2",
                    dark: "#0f172a",
                },
                sidebar: "#121212",
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'sans-serif'],
            },
            borderRadius: {
                'DEFAULT': '1rem',
                'xl': '1.5rem',
                '2xl': '2rem',
                '3xl': '2.5rem',
            },
        },
    },
    plugins: [],
}

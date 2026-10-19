/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                institutional: {
                    DEFAULT: '#0355a7',
                    dark: '#024a91',
                    50: '#eef6fd',
                    100: '#d9eafb',
                },
            },
            fontFamily: {
                sans: [
                    'Source Sans 3',
                    'ui-sans-serif',
                    'system-ui',
                    '-apple-system',
                    'Segoe UI',
                    'Roboto',
                    'Helvetica Neue',
                    'Arial',
                    'sans-serif',
                ],
                serif: ['Source Serif 4', 'Georgia', 'ui-serif', 'serif'],
            },
        },
    },
    plugins: [],
}

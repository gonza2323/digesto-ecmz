/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                institutional: {
                    DEFAULT: 'var(--bs-primary)',
                    dark: 'var(--bs-link-hover-color)',
                    nav: 'var(--bg-nav)',
                    50: '#eef6ff',
                    100: '#d9eaff',
                },

                site: 'var(--bg-sitio)',

                surface: 'var(--bg-light)',

                ink: 'var(--body-color)',

                'site-border': 'var(--bs-border-color-translucent)',
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

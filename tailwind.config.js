/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            backgroundImage: {
                'logo-welfare': "url('/images/logo-welfare.png')",
                'logo-kwangwoon': "url('/images/logo-kwangwoon.png')",
            },
        },
    },
    plugins: [],
};

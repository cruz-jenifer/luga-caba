import './globals.css';

export const metadata = {
    title: 'Lüga — Tu próximo hogar en CABA',
    description: 'Lüga centraliza la oferta de CABA y la cruza con datos reales de precios, subtes y estilo de vida.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body>{children}</body>
        </html>
    );
}

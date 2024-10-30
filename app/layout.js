import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/700.css';
import "./globals.css";
import { AuthProvider } from './contexts/AuthContext';
import { ChakraProvider, Box } from '@chakra-ui/react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import theme from './theme';

// Metadata for the application
export const metadata = {
  title: "Language Learning App",
  description: "An interactive language learning application",
};

/**
 * RootLayout component that wraps the entire application.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components.
 * @returns {JSX.Element} The rendered RootLayout component.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider theme={theme}>
          <AuthProvider>
            <Navigation />
            <Box as="main" display="flex" justifyContent="center" minHeight="80vh">
              {children}
            </Box>
            <Footer />
          </AuthProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}

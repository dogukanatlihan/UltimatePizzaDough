import { ThemeProvider } from './context/ThemeContext';
import { TranslationProvider } from './context/TranslationContext';
import ToastProvider from './components/ToastProvider';
import { TrePassi } from './design/TrePassi';

export default function App() {
  return (
    <ThemeProvider>
      <TranslationProvider>
        <ToastProvider>
          <TrePassi />
        </ToastProvider>
      </TranslationProvider>
    </ThemeProvider>
  );
}

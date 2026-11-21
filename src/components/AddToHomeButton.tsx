import { useEffect, useState } from 'react';
import { useTranslation } from '../context/TranslationContext';
import { useToast } from './ToastProvider';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

/** Shown only where it can do something: when the browser offers an install prompt, or on iOS outside home-screen mode. */
export default function AddToHomeButton() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [visible, setVisible] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIos(isIos);
    if (isIos && !(navigator as Navigator & { standalone?: boolean }).standalone) setVisible(true);

    const onPrompt = (e: Event) => {
      e.preventDefault(); // keep the event so the button can trigger it
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const onClick = async () => {
    if (ios) {
      // iOS has no install prompt; the user adds the page from the Share sheet.
      showToast(t('a2hs.ios'), 'info', { duration: 8000 });
    } else if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') setVisible(false);
      setInstallPrompt(null);
    }
  };

  if (!visible) return null;
  return <button type="button" className="btn btn-quiet" onClick={onClick}>{t('a2hs.button')}</button>;
}

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import en from './en.json';
import sw from './sw.json';

const resources = {
  en: { translation: en },
  sw: { translation: sw },
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: RNLocalize.getLocales()[0].languageCode || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18next;
import LocalizedStrings from 'react-native-localization';
import en from './en';
import ar from './ar';
import es from './es';
import de from './de';
import fr from './fr';
import tr from './tr';
import sv from './sv';
import zh from './zh';
import ru from './ru';
import pt from './pt';
import vi from './vi';
import hi from './hi';

let strings = new LocalizedStrings({
  en: en,
  ar: ar,
  es: es,
  de: de,
  fr: fr,
  tr: tr,
  sv: sv,
  zh: zh,
  ru: ru,
  pt: pt,
  vi: vi,
  hi: hi,
});
export const changeLaguage = (languageKey) => {
  strings.setLanguage(languageKey);
};
export default strings;

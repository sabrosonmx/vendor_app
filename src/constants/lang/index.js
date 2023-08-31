import LocalizedStrings from 'react-native-localization';
import ar from './ar';
import bn from './bn';
import de from './de';
import en from './en';
import fa from './fa';
import fr from './fr';
import hi from './hi';
import it from './it';
import ne from './ne';
import pt from './pt';
import ru from './ru';
import sv from './sv';
import tr from './tr';
import vi from './vi';
import zh from './zh';

import es_sabroson from './es_sabroson';
import heb from './heb';
import swa from './swa';

let strings = new LocalizedStrings({
  en: en,
  ar: ar,
  es: es_sabroson,
  de: de,
  fr: fr,
  tr: tr,
  sv: sv,
  zh: zh,
  ru: ru,
  pt: pt,
  vi: vi,
  hi: hi,
  ne: ne,
  it: it,
  fa: fa,
  swa: swa,
  bn:bn,
  he: heb,
});
export const changeLaguage = (languageKey) => {
  strings.setLanguage(languageKey);
};
export default strings;

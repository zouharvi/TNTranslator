import { TranslatorBackend } from '../messages/translator'
import { LanguageCode } from "./utils"

/**
 * Settings contains miscellaneous generic functions, but mostly a shared object of current settings.
 */
export class Settings {
    public static backendTranslator: TranslatorBackend
    public static language1?: LanguageCode = 'en'
    public static language2?: LanguageCode = 'cs'
}
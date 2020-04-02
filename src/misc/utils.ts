/**
 * Utils contains miscellaneous generic functions, mostly for data structures manipulation and text processing.
 * It has a role of a static class.
 */
export module Utils {
    /**
     * All supported languages have their language code stored here
     */
    export type LanguageCode = 'cs' | 'en' | 'fr' | 'ru' | 'hi' | 'de' | 'pl' | 'es' | 'et' | 'lt' | 'hu'

    /**
     * Storage for language code <-> language name relation.
     */
    let _langCodeToName = {
        cs: 'Czech',
        en: 'English',
        fr: 'French',
        ru: 'Russian',
        es: 'Spanish',
        hi: 'Hindi',
        de: 'German',
        pl: 'Polish',
        et: 'Estonian',
        lt: 'Lithuanian',
        hu: 'Hungarian',
    } as { [K in LanguageCode]: string }

    /**
     * All available languages
     */
    export let Languages: Set<LanguageCode> = new Set<LanguageCode>(Object.keys(_langCodeToName) as Array<LanguageCode>)


    /**
     * Returns a name of a language corresponding to given code. Throws an error if code is not recognized.
     * @param code Language code. 
     */
    export function languageName(code: LanguageCode): string | undefined {
        let a = _langCodeToName[code]
        if (code in _langCodeToName) {
            return _langCodeToName[code]
        } else {
            throw new Error('Unknown language code: `' + code + '`')
        }
    }
}

/**
 * Reexporting LanguageCode type
 */
export type LanguageCode = Utils.LanguageCode

import { AsyncMessage } from "./async_message"
import { Throttler } from "./throttler"
import { LanguageCode } from "../misc/utils"
import { Settings } from '../misc/settings'
import { IndicatorManager } from "../page/indicator_manager"
import { bread_manager } from '../page/bread_manager'

export type Translation = Array<Array<string>>

var TMP_FAKE_COUNTER: number = -1

/**
 * Template for forward and backward translators
 */
export class Translator extends AsyncMessage {
    private throttler = new Throttler(1000)

    /**
     * Make a translator request, which can be later interrupted. 
     */
    public translate_throttle() {
        this.throttler.throttle(this.translate)
    }

    /**
     * @param source Source textareat
     * @param target Target textarea
     */
    constructor(source: JQuery<HTMLElement>, target: JQuery<HTMLElement>, indicator: IndicatorManager) {
        super(indicator)
        this.source = source
        this.target = target
    }

    // Target HTML elements
    public source: JQuery<HTMLElement>
    public target: JQuery<HTMLElement>

    // Object of available backends and their implementations
    public static backends: { [index: string]: TranslatorBackend } = {
        // This won't work, because Lindat does not provide n-best list
        ufalTransformer: {
            composeRequest(text: string, must: Set<string>, forbid: Set<string>, sourceLang: LanguageCode, targetLang: LanguageCode): Promise<Translation> {
                return new Promise<Translation>((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        url: "https://lindat.mff.cuni.cz/services/transformer/api/v2/languages/",
                        headers: {
                            Accept: "application/json",
                        },
                        data: { src: sourceLang, tgt: targetLang, input_text: text },
                        async: true,
                    })
                        .done((data: Translation) => resolve(data))
                        .fail((xhr: JQueryXHR) => reject(xhr))
                })
            },
            name: 'ÚFAL Translation',
        },
        fakeLocal: {
            composeRequest(text: string, must: Set<string>, forbid: Set<string>, sourceLang: LanguageCode, targetLang: LanguageCode): Promise<Translation> {
                return new Promise<Translation>(async (resolve, reject) => {
                    await new Promise(resolve => setTimeout(resolve, 300))

                    // I bought a red sports car, which cost me a lot.
                    TMP_FAKE_COUNTER += 1
                    if (TMP_FAKE_COUNTER == 0) {
                        resolve([
                            ["Koupil", "Koupila"],
                            ["jsem", "si"],
                            ["si"], // change
                            ["červené", "červený", "červenou"],
                            ["sportovní"],
                            ["auto", "vůz", "sporťák"],
                            ["které", "který", "což"],
                            ["mě", "mně"],
                            ["stálo", "stojí"],
                            ["hodně", "dost"]
                        ])
                    } else if (TMP_FAKE_COUNTER == 1) {
                        resolve([
                            ["Koupil", "Koupila"],
                            ["jsem", "si"],
                            // ["si"], // change
                            ["červené", "červený", "červenou"],
                            ["sportovní"],
                            ["sporťák"],
                            ["které", "který", "což"],
                            ["mě", "mně"],
                            ["stál", "stojí"],
                            ["hodně", "dost"]
                        ])
                    } else if (TMP_FAKE_COUNTER == 2) {
                        resolve([
                            ["Koupil", "Koupila"],
                            ["jsem", "si"],
                            // ["si"], // change
                            ["červené", "červený", "červenou"],
                            // ["sportovní"],
                            ["sporťák"],
                            ["který", "kterého", "což"], // change
                            ["mě", "mně"],
                            ["stál", "stojí"],
                            ["hodně", "dost"]
                        ])
                    } else if (TMP_FAKE_COUNTER == 3) {
                        resolve([
                            ["Koupil", "Koupila"],
                            ["jsem", "si"],
                            // ["si"], // change
                            ["červené", "červený", "červenou"],
                            // ["sportovní"],
                            ["sporťák"],
                            ["který", "kterého", "což"], // change
                            ["mě", "mně"],
                            ["stál", "stojí"],
                            ["dost"] // change
                        ])
                    }
                })
            },
            name: 'Fake Local',
        }
    }

    public translate = () => {
        bread_manager.lock(true)
        let request = Settings.backendTranslator.composeRequest(
            $(this.source).val() as string,
            bread_manager.globalMust,
            bread_manager.globalForbid,
            Settings.language1 as LanguageCode,
            Settings.language2 as LanguageCode)

        request.then((translation: Translation) => {
            this.displayTranslationText(translation)
            bread_manager.instantiate(translation)
            bread_manager.lock(false)
        })

        super.dispatch(request)
    }

    public displayTranslationText(translation: Translation) {
        let curTranslationText = ''
        for (let breadslice of translation) {
            curTranslationText += breadslice[0] + ' '
        }
        $(this.target).val(curTranslationText)
    }

    public clean = () => {
        $(this.source).val('')
        $(this.target).val('')
    }
}

export interface TranslatorBackend {
    // Return a finished promise settings object, which can later be resolved
    composeRequest: (text: string, must: Set<string>, forbid: Set<string>, sourceLang: LanguageCode, targetLang: LanguageCode) => Promise<Translation>,

    // Proper backend name (not key)
    name: string,
}

let indicator_translator: IndicatorManager = new IndicatorManager($('#indicator_translator'))
let translator_source: Translator = new Translator($('#area_input'), $('#area_output'), indicator_translator)

// export translation singletons
export { translator_source, indicator_translator }
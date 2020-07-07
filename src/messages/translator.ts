import { AsyncMessage } from "./async_message"
import { Throttler } from "./throttler"
import { LanguageCode } from "../misc/utils"
import { Settings } from '../misc/settings'
import { IndicatorManager } from "../page/indicator_manager"
import { bread_manager } from '../page/bread_manager'

// export type Translation = Array<Array<string>>
export type Translation = Array<{ text: string, tokens: Array<string>, score: number }>

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
        sockEye: {
            composeRequest(text: string, must: Set<string>, forbid: Set<string>, sourceLang: LanguageCode, targetLang: LanguageCode): Promise<Translation> {
                return new Promise<Translation>((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        url: "https://quest.ms.mff.cuni.cz/bergamot180/paraphrase/en",
                        crossDomain: true,
                        data: JSON.stringify({ text: text, must: Array.from(must), forbid: Array.from(forbid) }),
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
                    if (TMP_FAKE_COUNTER >= 0) {
                        resolve([{
                            text: "Koupila jsem si červené sportovní auto které mě stálo hodně",
                            tokens: ["Koupila", "jsem", "si", "červené", "sportovní", "auto", "které", "mě", "stálo", "hodně"],
                            score: 0.5
                        },
                        {
                            text: "Koupil jsem si červený sportovní auto které mě stálo dost",
                            tokens: ["Koupil", "jsem", "si", "červené", "sportovní", "auto", "které", "mě", "stálo", "dost"],
                            score: 0.4
                        }])
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

        super.dispatch(request, (translation: Translation) => {
            this.displayTranslationText(translation)
            bread_manager.instantiate(translation)
            bread_manager.lock(false)
        })
    }

    public displayTranslationText(translation: Translation) {
        if (translation.length == 0) {
            $(this.target).val('')
        } else {
            $(this.target).val(translation[0].text)
        }

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
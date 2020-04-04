import { AsyncMessage } from "./async_message"
import { Throttler } from "./throttler"
import { LanguageCode } from "../misc/utils"
import { Settings } from '../misc/settings'
import { IndicatorManager } from "../page/indicator_manager"
import { bread_manager } from '../page/bread_manager'

export type Translation = Array<Array<[string, string]>>

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
            composeRequest(text: string, sourceLang: LanguageCode, targetLang: LanguageCode): Promise<Translation> {
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
            composeRequest(text: string, sourceLang: LanguageCode, targetLang: LanguageCode): Promise<Translation> {
                return new Promise<Translation>(async (resolve, reject) => {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    // I bought a red sports car, which cost me a lot.
                    resolve([
                        [["Koupil", 'blank'], ["Koupila", 'blank']],
                        [["jsem", 'blank'], ["si", 'blank']],
                        [["si", 'blank']],
                        [["červené", 'blank'], ["červený", 'blank'], ["červenou", 'blank']],
                        [["sportovní", 'blank']],
                        [["auto", 'blank'], ["vůz", 'blank'], ["sporťák", 'blank']],
                        [["které", 'blank'], ["který", 'blank'], ["což", 'blank']],
                        [["mě", 'blank'], ["mně", 'blank']],
                        [["stálo", 'blank'], ["stojí", 'blank']],
                        [["hodně", 'blank'], ["dost", 'blank']]
                    ])
                })
            },
            name: 'Fake Local',
        }
    }

    public translate = () => {
        bread_manager.lock(true)
        let request = Settings.backendTranslator.composeRequest(
            $(this.source).val() as string,
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
        for (let breadline of translation) {
            let isChosen = breadline.some((x) => x[1] == 'must')
            let available = breadline
            if (isChosen) {
                available = available.filter((x) => x[1] == 'must')
            } else {
                available = available.filter((x) => x[1] != 'forbid')
            }
            if (available.length != 0) {
                curTranslationText += available[0][0] + ' '
            }
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
    composeRequest: (text: string, sourceLang: LanguageCode, targetLang: LanguageCode) => Promise<Translation>,

    // Proper backend name (not key)
    name: string,
}

let indicator_translator: IndicatorManager = new IndicatorManager($('#indicator_translator'))
let translator_source: Translator = new Translator($('#area_input'), $('#area_output'), indicator_translator)

// export translation singletons
export { translator_source, indicator_translator }
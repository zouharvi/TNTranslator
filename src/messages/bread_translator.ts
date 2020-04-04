import { AsyncMessage } from "./async_message"
import { Throttler } from "./throttler"
import { LanguageCode } from "../misc/utils"
import { Settings } from '../misc/settings'
import { IndicatorManager } from "../page/indicator_manager"
import { bread_manager } from '../page/bread_manager'
import { translator_source } from './translator'

export type Translation = Array<Array<[string, string]>>

var TMP_FAKE_COUNTER: number = -1

/**
 * Template for forward and backward translators
 */
export class BreadTranslator extends AsyncMessage {
    private throttler = new Throttler(700)

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
    constructor(indicator: IndicatorManager) {
        super(indicator)
    }

    // Object of available backends and their implementations
    public static backends: { [index: string]: BreadTranslatorBackend } = {
        // This won't work, because Lindat does not provide n-best list
        // ufalTransformer: {
        //     composeRequest(text: string, sourceLang: LanguageCode, targetLang: LanguageCode): Promise<Translation> {
        //         return new Promise<Translation>((resolve, reject) => {
        //             $.ajax({
        //                 type: "POST",
        //                 url: "https://lindat.mff.cuni.cz/services/transformer/api/v2/languages/",
        //                 headers: {
        //                     Accept: "application/json",
        //                 },
        //                 data: { src: sourceLang, tgt: targetLang, input_text: text },
        //                 async: true,
        //             })
        //                 .done((data: Translation) => resolve(data))
        //                 .fail((xhr: JQueryXHR) => reject(xhr))
        //         })
        //     },
        //     name: 'ÚFAL Translation',
        // },
        fakeLocal: {
            composeRequest(bread: Translation, sourceLang: LanguageCode, targetLang: LanguageCode): Promise<Translation> {
                return new Promise<Translation>(async (resolve, reject) => {
                    await new Promise(resolve => setTimeout(resolve, 300))

                    // I bought a red sports car, which cost me a lot.
                    TMP_FAKE_COUNTER += 1
                    if (TMP_FAKE_COUNTER == 0) {
                        resolve([
                            [["Koupil", 'blank'], ["Koupila", 'blank']],
                            [["jsem", 'blank'], ["si", 'blank']],
                            [["si", 'forbid']], // change
                            [["červené", 'blank'], ["červený", 'blank'], ["červenou", 'blank']],
                            [["sportovní", 'blank']],
                            [["auto", 'blank'], ["vůz", 'blank'], ["sporťák", 'blank']],
                            [["které", 'blank'], ["který", 'blank'], ["což", 'blank']],
                            [["mě", 'blank'], ["mně", 'blank']],
                            [["stálo", 'blank'], ["stojí", 'blank']],
                            [["hodně", 'blank'], ["dost", 'blank']]
                        ])
                    } else if (TMP_FAKE_COUNTER == 1) {
                        resolve([
                            [["Koupil", 'blank'], ["Koupila", 'blank']],
                            [["jsem", 'blank'], ["si", 'blank']],
                            [["si", 'forbid']],
                            [["červený", 'blank'], ["červené", 'blank'], ["červenou", 'blank']],
                            // [["sportovní", 'blank']],
                            [["sporťák", 'must'], ["vůz", 'must'], ["auto", 'blank']], // change
                            [["který", 'blank'], ["kterého", 'blank']], // change
                            [["mě", 'blank'], ["mně", 'blank']],
                            [["stál", 'blank'], ["stojí", 'blank']], // change
                            [["hodně", 'blank'], ["dost", 'blank']]
                        ])
                    } else if (TMP_FAKE_COUNTER == 2) {
                        resolve([
                            [["Koupil", 'blank'], ["Koupila", 'blank']],
                            [["jsem", 'blank'], ["si", 'blank']],
                            [["si", 'forbid']],
                            [["červený", 'blank'], ["červené", 'blank'], ["červenou", 'blank']],
                            // [["sportovní", 'blank']],
                            [["sporťák", 'must'], ["vůz", 'must'], ["auto", 'blank']], // change
                            [["který", 'blank'], ["kterého", 'blank']], // change
                            [["mě", 'blank'], ["mně", 'blank']],
                            [["stál", 'blank'], ["stojí", 'blank']], // change
                            [["dost", 'must'], ["hodně", 'blank']]
                        ])
                    }
                    // VANILLA
                    // resolve([
                    //     [["Koupil", 'blank'], ["Koupila", 'blank']],
                    //     [["jsem", 'blank'], ["si", 'blank']],
                    //     [["si", 'forbid']],
                    //     [["červené", 'blank'], ["červený", 'blank'], ["červenou", 'blank']],
                    //     [["sportovní", 'blank']],
                    //     [["auto", 'blank'], ["vůz", 'blank'], ["sporťák", 'blank']],
                    //     [["které", 'blank'], ["který", 'blank'], ["což", 'blank']],
                    //     [["mě", 'blank'], ["mně", 'blank']],
                    //     [["stálo", 'blank'], ["stojí", 'blank']],
                    //     [["hodně", 'blank'], ["dost", 'blank']]
                    // ])
                })
            },
            name: 'Fake Local',
        }
    }

    public translate = () => {
        bread_manager.lock(true)
        let request = Settings.backendBreadTranslator.composeRequest(
            bread_manager.bread,
            Settings.language1 as LanguageCode,
            Settings.language2 as LanguageCode)

        request.then((translation: Translation) => {
            bread_manager.instantiate(translation)
            translator_source.displayTranslationText(translation)
            console.log(translation)
            bread_manager.lock(false)
        })

        super.dispatch(request)
    }

    public clean = () => {

    }
}

export interface BreadTranslatorBackend {
    // Return a finished promise settings object, which can later be resolved
    composeRequest: (text: Translation, sourceLang: LanguageCode, targetLang: LanguageCode) => Promise<Translation>,

    // Proper backend name (not key)
    name: string,
}

let indicator_translator: IndicatorManager = new IndicatorManager($('#indicator_bread_translator'))
let translator_bread: BreadTranslator = new BreadTranslator(indicator_translator)

// export translation singletons
export { translator_bread, indicator_translator }
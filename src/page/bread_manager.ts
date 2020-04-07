import { Translation, translator_source } from '../messages/translator'

export type BreadcrumbType = 'blank' | 'must' | 'forbid'

export class BreadManager {
    public bread : Translation = []
    public tokensMust : Set<string> = new Set<string>()
    public tokensForbid : Set<string> = new Set<string>()

    public constructor(private area_bread: JQuery<HTMLElement>, private area_bread_overlay: JQuery<HTMLElement>) {

    }

    public instantiate(translation: Translation) {
        // clean
        this.area_bread.html('')
        this.bread = []

        let toAdd: string = ''
        for (let i in translation) {
            let breadslice = translation[i]
            let breadString = '<div class="bread">'
            let breadsliceArray = []
            for (let j in breadslice) {
                let breadcrumb = breadslice[j]
                breadsliceArray.push(breadcrumb)
                let state = 'blank'
                if (this.tokensMust.has(breadcrumb)) {
                    state = 'must'
                } else if(this.tokensForbid.has(breadcrumb)) {
                    state = 'forbid'
                }
                breadString += `<div row='${i}' column='${j}'onclick='breadcrumbClick(this)' class='breadcrumb breadcrumb_${state}'>`
                breadString += breadcrumb
                breadString += "</div>"
            }
            // input
            // breadString += "<div row='" + i + "' column='" + breadslice.length + "'onclick='breadcrumbInput(this)' class='breadcrumb breadcrumb_input'>"
            breadString += '</div>'
            toAdd += breadString
            this.bread.push(breadsliceArray)
        }
        this.area_bread.html(toAdd)
    }

    public clean() {
        this.tokensForbid = new Set<string>()
        this.tokensMust = new Set<string>()
    }

    public breadcrumbClick(helement: HTMLElement) {
        let element = $(helement)
        let column = Number(element.attr('column'))
        let row = Number(element.attr('row'))
        let text = element.text()
        console.log(text)

        if (element.hasClass('breadcrumb_blank')) {
            element.removeClass('breadcrumb_blank')
            element.addClass('breadcrumb_must')
            bread_manager.tokensMust.add(text)
            bread_manager.tokensForbid.delete(text)
        } else if (element.hasClass('breadcrumb_must')) {
            element.removeClass('breadcrumb_must')
            element.addClass('breadcrumb_forbid')
            bread_manager.tokensMust.delete(text)
            bread_manager.tokensForbid.add(text)
        } else if (element.hasClass('breadcrumb_forbid')) {
            element.removeClass('breadcrumb_forbid')
            element.addClass('breadcrumb_blank')
            bread_manager.tokensMust.delete(text)
            bread_manager.tokensForbid.delete(text)
        }
        translator_source.translate_throttle()
    }

    public lock(lock: boolean) {
        if (lock) {
            this.area_bread_overlay.show()
        } else {
            this.area_bread_overlay.hide()
        }
    }
}

let bread_manager = new BreadManager($('#area_bread'), $('#area_bread_overlay'));

(window as any).breadcrumbClick = bread_manager.breadcrumbClick;
(window as any).breadcrumbInput = (element: any) => console.log(element);

export { bread_manager }
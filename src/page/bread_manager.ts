import { Translation } from '../messages/translator'

export type BreadcrumbType = 'blank' | 'must' | 'forbid'

// export type Bread = Array<Array<Breadcrumb>>
// export class Breadcrumb {
//     public constructor(private row: number, private column: number) {
//     }
// }

export class BreadManager {
    // private bread : Bread = []

    public constructor(private area_bread: JQuery<HTMLElement>, private area_bread_overlay: JQuery<HTMLElement>) {

    }

    public instantiate(translation: Translation) {
        // clean
        this.area_bread.html('')

        let toAdd: string = ''
        for (let i in translation) {
            let breadline = translation[i]
            let breadString = '<div class="bread">'
            for (let j in breadline) {
                let breadcrumb = breadline[j]
                breadString += `<div row='${i}' column='${j}'onclick='breadcrumbClick(this)' class='breadcrumb breadcrumb_${breadcrumb[1]}'>`
                breadString += breadcrumb[0]
                breadString += "</div>"
            }
            // input
            // breadString += "<div row='" + i + "' column='" + breadline.length + "'onclick='breadcrumbInput(this)' class='breadcrumb breadcrumb_input'>"
            breadString += '</div>'
            toAdd += breadString
        }
        this.area_bread.html(toAdd)
    }

    public breadcrumbClick(helement: HTMLElement) {
        console.log(helement)
        let element = $(helement)
        if (element.hasClass('breadcrumb_blank')) {
            element.removeClass('breadcrumb_blank')
            element.addClass('breadcrumb_must')
        } else if (element.hasClass('breadcrumb_must')) {
            element.removeClass('breadcrumb_must')
            element.addClass('breadcrumb_forbid')
        } else if (element.hasClass('breadcrumb_forbid')) {
            element.removeClass('breadcrumb_forbid')
            element.addClass('breadcrumb_blank')
        }
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
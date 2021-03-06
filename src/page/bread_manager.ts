import { Translation, translator_source } from '../messages/translator'

export type BreadcrumbType = 'blank' | 'must' | 'forbid'

export class BreadManager {
    public globalMust: Set<string> = new Set<string>()
    public globalForbid: Set<string> = new Set<string>()

    public constructor(
        private div_bread: JQuery<HTMLElement>,
        private area_bread: JQuery<HTMLElement>,
        private area_bread_overlay: JQuery<HTMLElement>,
        private global_tokens_must: JQuery<HTMLElement>, private global_tokens_must_in: JQuery<HTMLElement>,
        private global_tokens_forbid: JQuery<HTMLElement>, private global_tokens_forbid_in: JQuery<HTMLElement>
    ) {
    }

    private lastTranslation?: Translation

    public instantiate(translation?: Translation) {
        if (translation == undefined) {
            if (this.lastTranslation != undefined) {
                translation = this.lastTranslation
            } else {
                throw new Error('Last Translation is not yet available')
            }
        } else {
            this.lastTranslation = translation
        }

        if (translation.length != 0) {
            this.div_bread.show()
        } else {
            this.div_bread.hide()
        }

        // clean
        this.area_bread.html('')

        let toAdd: string = ''
        for (let sI in translation) {
            let sentence = translation[sI]
            let breadString = '<div class="bread">'
            for (let j in sentence.tokens) {
                let breadcrumb = sentence.tokens[j]
                let state = 'blank'
                if (this.globalMust.has(breadcrumb)) {
                    state = 'must'
                } else if (this.globalForbid.has(breadcrumb)) {
                    state = 'forbid'
                }

                let extraClass = '';
                if (this.globalMust.has(breadcrumb)) {
                    extraClass = ' globalMust '
                }
                breadString += `<div onclick='breadcrumbClick(this)' class='breadcrumb breadcrumb_${state} ${extraClass}'>`
                breadString += breadcrumb
                breadString += "</div>"
            }
            // input
            // breadString += "<div row='" + i + "' column='" + breadslice.length + "'onclick='breadcrumbInput(this)' class='breadcrumb breadcrumb_input'>"
            breadString += '</div>'
            toAdd += breadString
        }
        this.area_bread.html(toAdd)
    }

    public updateGlobalBreadslice() {
        if (this.globalMust.size == 0) {
            // $(this.global_tokens_must).hide()
            $(this.global_tokens_must).html()
        } else {
            // $(this.global_tokens_must).show()
            let outputHTML = ''
            for (let breadcrumb of this.globalMust) {
                outputHTML += `<div onclick='breadcrumbGlobalClick(this)' class='breadcrumb breadcrumb_must'>${breadcrumb}</div>`
            }
            $(this.global_tokens_must_in).html(outputHTML)
        }

        if (this.globalForbid.size == 0) {
            // $(this.global_tokens_forbid).hide()
            $(this.global_tokens_forbid).html()
        } else {
            // $(this.global_tokens_forbid).show()
            let outputHTML = ''
            for (let breadcrumb of this.globalForbid) {
                outputHTML += `<div onclick='breadcrumbGlobalClick(this)' class='breadcrumb breadcrumb_forbid'>${breadcrumb}</div>`
            }
            $(this.global_tokens_forbid_in).html(outputHTML)
        }
    }


    public clean() {
        this.globalForbid = new Set<string>()
        this.globalMust = new Set<string>()
    }

    public breadcrumbGlobalInput(val: string, buttonElement: JQuery<HTMLElement>) {
        // let val = inputElement.val() as string
        if (val.length == 0) {
            buttonElement.hide()
        } else {
            buttonElement.show()
        }
    }

    public breadcrumbGlobalAddClick(inputElement: JQuery<HTMLElement>, type: 'must' | 'forbid') {
        let val: string = inputElement.val() as string
        if (type == 'must') {
            bread_manager.globalMust.add(val)
        } else if (type == 'forbid') {
            bread_manager.globalForbid.add(val)
        }
        inputElement.val('')
        inputElement.focus()
        bread_manager.updateGlobalBreadslice()
        translator_source.translate_throttle()
    }

    public breadcrumbGlobalClick(helement: HTMLElement) {
        let element = $(helement)
        let text = element.text()
        bread_manager.globalForbid.delete(text)
        bread_manager.globalMust.delete(text)
        bread_manager.updateGlobalBreadslice()
        bread_manager.instantiate()
        translator_source.translate_throttle()
    }

    public breadcrumbClick(helement: HTMLElement) {
        let element = $(helement)
        let text = element.text()

        if (element.hasClass('breadcrumb_blank')) {
            element.removeClass('breadcrumb_blank')
            element.addClass('breadcrumb_must')
            bread_manager.globalMust.add(text)
            bread_manager.globalForbid.delete(text)
        } else if (element.hasClass('breadcrumb_must')) {
            element.removeClass('breadcrumb_must')
            element.addClass('breadcrumb_forbid')
            bread_manager.globalMust.delete(text)
            bread_manager.globalForbid.add(text)
        } else if (element.hasClass('breadcrumb_forbid')) {
            element.removeClass('breadcrumb_forbid')
            element.addClass('breadcrumb_blank')
            bread_manager.globalMust.delete(text)
            bread_manager.globalForbid.delete(text)
        }
        translator_source.translate_throttle()
        bread_manager.updateGlobalBreadslice()
    }

    public lock(lock: boolean) {
        if (lock) {
            this.area_bread_overlay.show()
        } else {
            this.area_bread_overlay.hide()
        }
    }
}

let bread_manager = new BreadManager(
    $('#div_bread'),
    $('#area_bread'),
    $('#area_bread_overlay'),
    $('#area_bread_must'), $('#area_bread_must_in'),
    $('#area_bread_forbid'), $('#area_bread_forbid_in')
);

(window as any).breadcrumbClick = bread_manager.breadcrumbClick;
(window as any).breadcrumbGlobalClick = bread_manager.breadcrumbGlobalClick;
(window as any).breadcrumbInput = (element: any) => console.log(element);

$('#breadcrumb_global_must_form').on(
    'input',
    (e: any) => bread_manager.breadcrumbGlobalInput($(e.target)[0].value as string, $('#breadcrumb_global_must_add'))
)
$('#breadcrumb_global_forbid_form').on(
    'input',
    (e: any) => bread_manager.breadcrumbGlobalInput($(e.target)[0].value as string, $('#breadcrumb_global_forbid_add'))
)
$('#breadcrumb_global_must_add').click(() => bread_manager.breadcrumbGlobalAddClick($('#breadcrumb_global_must_input'), 'must'))
$('#breadcrumb_global_forbid_add').click(() => bread_manager.breadcrumbGlobalAddClick($('#breadcrumb_global_forbid_input'), 'forbid'))

$('#breadcrumb_global_forbid_input')


export { bread_manager }
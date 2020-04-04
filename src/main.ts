import { Translator, translator_source } from './messages/translator'
import { BreadTranslator, translator_bread } from './messages/bread_translator'
import { Settings } from './misc/settings'

// Force files to execute
translator_source

$('#area_input').on('input', function () {
    translator_source.translate_throttle()
})
// $('#area_input').val('I bought a red sports car, which cost me a lot.')
// $('#area_input').trigger('input')

Settings.backendTranslator = Translator.backends.fakeLocal
Settings.backendBreadTranslator = BreadTranslator.backends.fakeLocal

import { Translator, translator_source } from './messages/translator'
import { Settings } from './misc/settings'

// Force files to execute
translator_source

$('#area_input').on('input', function () {
    translator_source.translate_throttle()
})
$('#area_input').trigger('input')

Settings.backendTranslator = Translator.backends.fakeLocal

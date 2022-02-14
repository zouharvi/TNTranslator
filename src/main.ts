import { Translator, translator_source } from './messages/translator'
import { bread_manager } from './page/bread_manager'
import { Settings } from './misc/settings'

// Force files to execute
translator_source

$('#area_input').on('input', function () {
    translator_source.translate_throttle()
    bread_manager.clean()
})
$('#area_input').val('I bought a red sports car, which cost me a lot.')
$('#area_input').trigger('input')

Settings.backendTranslator = Translator.backends.fakeLocal

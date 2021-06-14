import Component from '@glimmer/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';

export default class GhFontSelector extends Component {
    @service intl;

    get options() {
        return [{
            name: this.intl.t('editor.font.Elegant serif'),
            description: this.intl.t('editor.font.Beautiful lines with great readability'),
            value: 'serif'
        }, {
            name: this.intl.t('editor.font.Clean sans-serif'),
            description: this.intl.t('editor.font.A more minimal style with sharp lines'),
            value: 'sans_serif'
        }];
    }

    get selectedOption() {
        return this.options.find(o => o.value === this.args.selected);
    }

    @action
    selectOption(option) {
        this.args.onChange(option.value);
    }
}

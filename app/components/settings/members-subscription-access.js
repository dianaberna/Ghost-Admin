import Component from '@glimmer/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';

export default class SettingsMembersSubscriptionAccess extends Component {
    @service settings;
    @service intl;

    get options() {
        return [{
            name: this.intl.t('members.Anyone can sign up'),
            description: this.intl.t('members.All visitors will be able to subscribe and sign in'),
            value: 'all',
            icon: 'globe',
            icon_color: 'green'
        }, {
            name: this.intl.t('members.Only people I invite'),
            description: this.intl.t('members.People can sign in from your site but won\'t be able to sign up'),
            value: 'invite',
            icon: 'email-love-letter',
            icon_color: 'blue'
        }, {
            name: this.intl.t('members.Nobody'),
            description: this.intl.t('members.No one will be able to subscribe or sign in'),
            value: 'none',
            icon: 'no-members',
            icon_color: 'midlightgrey-d2'
        }];
    }

    get selectedOption() {
        return this.options.find(o => o.value === this.settings.get('membersSignupAccess'));
    }

    @action
    setSignupAccess(option) {
        this.settings.set('membersSignupAccess', option.value);
        this.args.onChange?.(option.value);

        if (option.value === 'none') {
            this.settings.set('defaultContentVisibility', 'public');
        }
    }
}

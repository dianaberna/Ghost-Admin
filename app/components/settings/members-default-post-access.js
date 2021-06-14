import Component from '@glimmer/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';

export default class SettingsMembersDefaultPostAccess extends Component {
    @service intl;
    @service settings;

    get options() {
        return [{
            name: this.intl.t('psm.Public'),
            description: this.intl.t('psm.All site visitors to your site, no login required'),
            value: 'public',
            icon: 'globe',
            icon_color: 'green'
        }, {
            name: this.intl.t('psm.Members only'),
            description: this.intl.t('psm.All logged-in members'),
            value: 'members',
            icon: 'members-all',
            icon_color: 'blue'
        }, {
            name: this.intl.t('psm.Paid-members only'),
            description: this.intl.t('psm.Only logged-in members with an active Stripe subscription'),
            value: 'paid',
            icon: 'members-paid',
            icon_color: 'pink'
        }];
    }

    get selectedOption() {
        if (this.settings.get('membersSignupAccess') === 'none') {
            return this.options.find(o => o.value === 'public');
        }

        return this.options.find(o => o.value === this.settings.get('defaultContentVisibility'));
    }

    @action
    setDefaultContentVisibility(option) {
        if (this.settings.get('membersSignupAccess') !== 'none') {
            this.settings.set('defaultContentVisibility', option.value);
        }
    }
}

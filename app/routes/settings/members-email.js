import AuthenticatedRoute from 'ghost-admin/routes/authenticated';
import CurrentUserSettings from 'ghost-admin/mixins/current-user-settings';
import {inject as service} from '@ember/service';

export default AuthenticatedRoute.extend(CurrentUserSettings, {
    notifications: service(),
    intl: service(),
    settings: service(),

    beforeModel(transition) {
        this._super(...arguments);
        return this.get('session.user')
            .then(this.transitionAuthor())
            .then(this.transitionEditor())
            .then(() => {
                if (transition.to.queryParams?.fromAddressUpdate === 'success') {
                    this.notifications.showAlert(
                        this.intl.t(`Newsletter email address has been updated`),
                        {type: 'success', key: 'members.settings.from-address.updated'}
                    );
                } else if (transition.to.queryParams?.supportAddressUpdate === 'success') {
                    this.notifications.showAlert(
                        this.intl.t(`Support email address has been updated`).htmlSafe(),
                        {type: 'success', key: 'members.settings.support-address.updated'}
                    );
                }
            });
    },

    model() {
        return this.settings.reload();
    },

    setupController(controller) {
        controller.resetEmailAddresses();
    },

    actions: {
        willTransition(transition) {
            return this.controller.leaveRoute(transition);
        }
    },

    buildRouteInfoMetadata() {
        return {
            titleToken: this.intl.t('pageTitle.Settings - Members')
        };
    }
});

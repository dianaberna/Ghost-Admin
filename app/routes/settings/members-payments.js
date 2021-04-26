import AuthenticatedRoute from 'ghost-admin/routes/authenticated';
import {inject as service} from '@ember/service';

export default class MembersPaymentsRoute extends AuthenticatedRoute {
    @service session;
    @service settings;
    @service intl;

    beforeModel() {
        super.beforeModel(...arguments);

        return this.session.get('user').then((user) => {
            if (!user.isOwner && user.isAdmin) {
                return this.transitionTo('settings');
            } else if (!user.isOwner) {
                return this.transitionTo('home');
            }
        });
    }

    model() {
        return this.settings.reload();
    }

    actions = {
        willTransition(transition) {
            return this.controller.leaveRoute(transition);
        }
    }

    resetController(controller, isExiting) {
        if (isExiting) {
            controller.reset();
        }
    }

    buildRouteInfoMetadata() {
        return {
            titleToken: this.intl.t('pageTitle.Settings - Members')
        };
    }
}

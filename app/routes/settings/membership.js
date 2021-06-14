import AuthenticatedRoute from 'ghost-admin/routes/authenticated';
import {inject as service} from '@ember/service';

export default class MembershipSettingsRoute extends AuthenticatedRoute {
    @service settings;
    @service intl;

    model() {
        this.settings.reload();
    }

    actions = {
        willTransition(transition) {
            return this.controller.leaveRoute(transition);
        }
    }

    buildRouteInfoMetadata() {
        return {
            titleToken: this.intl.t('pageTitle.Settings - Membership')
        };
    }

    resetController(controller, isExiting) {
        if (isExiting) {
            controller.reset();
        }
    }
}

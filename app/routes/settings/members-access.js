import AuthenticatedRoute from 'ghost-admin/routes/authenticated';
import {inject as service} from '@ember/service';

export default class MembersAccessRoute extends AuthenticatedRoute {
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
            titleToken: this.intl.t('pageTitle.Settings - Members')
        };
    }
}

import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import AuthConfiguration from 'ember-simple-auth/configuration';
import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import ShortcutsRoute from 'ghost-admin/mixins/shortcuts-route';
import ctrlOrCmd from 'ghost-admin/utils/ctrl-or-cmd';
import moment from 'moment';
import windowProxy from 'ghost-admin/utils/window-proxy';
import {
    isAjaxError,
    isNotFoundError,
    isUnauthorizedError
} from 'ember-ajax/errors';
import {isArray as isEmberArray} from '@ember/array';
import {
    isMaintenanceError,
    isVersionMismatchError
} from 'ghost-admin/services/ajax';
import {run} from '@ember/runloop';
import {inject as service} from '@ember/service';

function K() {
    return this;
}

let shortcuts = {};

shortcuts.esc = {action: 'closeMenus', scope: 'default'};
shortcuts[`${ctrlOrCmd}+s`] = {action: 'save', scope: 'all'};

export default Route.extend(ApplicationRouteMixin, ShortcutsRoute, {
    ajax: service(),
    config: service(),
    feature: service(),
    ghostPaths: service(),
    notifications: service(),
    router: service(),
    settings: service(),
    tour: service(),
    ui: service(),
    intl: service(),
    lazyLoader: service(),

    shortcuts,

    routeAfterAuthentication: 'home',

    init() {
        this._super(...arguments);
        this.router.on('routeDidChange', () => {
            this.notifications.displayDelayed();
        });
    },

    beforeModel() {
        return this.config.fetchUnauthenticated().then(() => {
            return this.ajax.request(`${this.ghostPaths.adminRoot}assets/locales/en.json`)
                .then(translations => this.intl.addTranslations('en', translations))
                .then(() => this.intl.setLocale(['en']))
                .then(() => {
                    if (this.config.get('defaultLocale')) {
                        return RSVP.all([
                            this.lazyLoader
                                .loadScript('moment-locale', `assets/moment/locale/${this.config.get('defaultLocale')}.js`)
                                .then(() => moment.locale(this.config.get('defaultLocale')))
                                .catch(() => (`Looks like momentjs doesn't support your "${this.config.get('defaultLocale')}" locale`)),
                            this.ajax.request(`${this.ghostPaths.adminRoot}assets/locales/${this.config.get('defaultLocale')}.json`)
                                .then(translations => this.intl.addTranslations(this.config.get('defaultLocale'), translations))
                                .then(() => this.intl.setLocale([this.config.get('defaultLocale')].concat(this.intl.locales)))
                                .catch(e => (`Failed to init translations for "${this.config.get('defaultLocale')}" locale: ${e.message}`))
                        ]);
                    }
                });
        });
    },

    afterModel(model, transition) {
        this._super(...arguments);

        if (this.get('session.isAuthenticated')) {
            this.set('appLoadTransition', transition);
            transition.send('loadServerNotifications');

            let configPromise = this.config.fetchAuthenticated();
            let featurePromise = this.feature.fetch();
            let settingsPromise = this.settings.fetch();
            let tourPromise = this.tour.fetchViewed();

            // return the feature/settings load promises so that we block until
            // they are loaded to enable synchronous access everywhere
            return RSVP.all([
                configPromise,
                featurePromise,
                settingsPromise,
                tourPromise
            ]).then((results) => {
                this._appLoaded = true;
                return results;
            });
        }

        this._appLoaded = true;
    },

    actions: {
        closeMenus() {
            this.ui.closeMenus();
        },

        didTransition() {
            this.set('appLoadTransition', null);
            this.send('closeMenus');
        },

        signedIn() {
            this.notifications.clearAll();
            this.send('loadServerNotifications', true);
        },

        authorizationFailed() {
            windowProxy.replaceLocation(AuthConfiguration.rootURL);
        },

        loadServerNotifications(isDelayed) {
            if (this.get('session.isAuthenticated')) {
                this.get('session.user').then((user) => {
                    if (!user.get('isAuthorOrContributor')) {
                        this.store.findAll('notification', {reload: true}).then((serverNotifications) => {
                            serverNotifications.forEach((notification) => {
                                if (notification.get('top') || notification.get('custom')) {
                                    this.notifications.handleNotification(notification, isDelayed);
                                } else {
                                    this.upgradeStatus.handleUpgradeNotification(notification);
                                }
                            });
                        });
                    }
                });
            }
        },

        // noop default for unhandled save (used from shortcuts)
        save: K,

        error(error, transition) {
            // unauthoirized errors are already handled in the ajax service
            if (isUnauthorizedError(error)) {
                return false;
            }

            if (isNotFoundError(error)) {
                if (transition) {
                    transition.abort();
                }

                let routeInfo = transition.to;
                let router = this.router;
                let params = [];

                for (let key of Object.keys(routeInfo.params)) {
                    params.push(routeInfo.params[key]);
                }

                let url = router.urlFor(routeInfo.name, ...params)
                    .replace(/^#\//, '')
                    .replace(/^\//, '')
                    .replace(/^ghost\//, '');

                return this.replaceWith('error404', url);
            }

            if (isVersionMismatchError(error)) {
                if (transition) {
                    transition.abort();
                }

                this.upgradeStatus.requireUpgrade();

                if (this._appLoaded) {
                    return false;
                }
            }

            if (isMaintenanceError(error)) {
                if (transition) {
                    transition.abort();
                }

                this.upgradeStatus.maintenanceAlert();

                if (this._appLoaded) {
                    return false;
                }
            }

            if (isAjaxError(error) || error && error.payload && isEmberArray(error.payload.errors)) {
                this.notifications.showAPIError(error);
                // don't show the 500 page if we weren't navigating
                if (!transition) {
                    return false;
                }
            }

            // fallback to 500 error page
            return true;
        }
    },

    sessionAuthenticated() {
        if (this.get('session.skipAuthSuccessHandler')) {
            return;
        }

        // standard ESA post-sign-in redirect
        this._super(...arguments);

        // trigger post-sign-in background behaviour
        this.get('session.user').then((user) => {
            this.send('signedIn', user);
        });
    },

    sessionInvalidated() {
        let transition = this.appLoadTransition;

        if (transition) {
            transition.send('authorizationFailed');
        } else {
            run.scheduleOnce('routerTransitions', this, function () {
                this.send('authorizationFailed');
            });
        }
    }
});

import PostsController from './posts';
import {computed} from '@ember/object';

const TYPES = [{
    name: 'filter.All pages',
    value: null
}, {
    name: 'filter.Draft pages',
    value: 'draft'
}, {
    name: 'filter.Published pages',
    value: 'published'
}, {
    name: 'filter.Scheduled pages',
    value: 'scheduled'
}, {
    name: 'filter.Featured pages',
    value: 'featured'
}];

const ORDERS = [{
    name: 'order.Newest',
    value: null
}, {
    name: 'order.Oldest',
    value: 'published_at asc'
}, {
    name: 'order.Recently updated',
    value: 'updated_at desc'
}];

/* eslint-disable ghost/ember/alias-model-in-controller */
export default PostsController.extend({
    init() {
        this._super(...arguments);
        this.availableTypes = TYPES;
        this.availableOrders = ORDERS;
    },

    availableTypes: computed('intl.locale', function () {
        return TYPES.map(({name, value}) => Object({name: this.intl.t(name).toString(), value}));
    }),

    availableOrders: computed('intl.locale', function () {
        return ORDERS.map(({name, value}) => Object({name: this.intl.t(name).toString(), value}));
    }),

    actions: {
        openEditor(page) {
            this.transitionToRoute('editor.edit', 'page', page.get('id'));
        }
    }
});

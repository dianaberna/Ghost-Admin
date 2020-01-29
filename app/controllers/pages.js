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

/* eslint-disable ghost/ember/alias-model-in-controller */
export default PostsController.extend({
    init() {
        this._super(...arguments);
    },

    availableTypes: computed('intl.locale', function () {
        return TYPES.map(({name, value}) => Object({name: this.intl.t(name).toString(), value}));
    }),

    actions: {
        openEditor(page) {
            this.transitionToRoute('editor.edit', 'page', page.get('id'));
        }
    }
});

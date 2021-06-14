import Component from '@ember/component';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';

const VISIBILITIES = [
    {label: 'psm.Public', name: 'public'},
    {label: 'psm.Members only', name: 'members'},
    {label: 'psm.Paid-members only', name: 'paid'}
];

export default Component.extend({
    intl: service(),
    settings: service(),

    // public attrs
    post: null,

    selectedVisibility: computed('post.visibility', function () {
        return this.get('post.visibility') || this.settings.get('defaultContentVisibility');
    }),

    init() {
        this._super(...arguments);
        this.availableVisibilities = VISIBILITIES.map(({label, name}) => ({
            name, label: this.intl.t(label)
        }));
    },

    actions: {
        updateVisibility(newVisibility) {
            this.post.set('visibility', newVisibility);
        }
    }
});

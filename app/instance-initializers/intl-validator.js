import BaseValidator from 'ghost-admin/validators/base';
export function initialize(applicationInstance) {
    //dirty hack to "inject" intl into objects without containers
    BaseValidator.reopen({intl: applicationInstance.lookup('service:intl')});
}

export default {
    name: 'intl-validator',
    initialize
};

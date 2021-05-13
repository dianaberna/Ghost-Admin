import EmberObject, {action} from '@ember/object';
import ModalBase from 'ghost-admin/components/modal-base';
import classic from 'ember-classic-decorator';
import {currencies} from 'ghost-admin/utils/currency';
import {isEmpty} from '@ember/utils';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency-decorators';
import {tracked} from '@glimmer/tracking';

// TODO: update modals to work fully with Glimmer components
@classic
export default class ModalProductPrice extends ModalBase {
    @service intl;
    @tracked model;
    @tracked price;
    @tracked currencyVal;
    @tracked periodVal;
    @tracked errors = EmberObject.create();

    init() {
        super.init(...arguments);
        this.price = {
            ...(this.model.price || {})
        };
        this.topCurrencies = currencies.slice(0, 5).map((currency) => {
            return {
                value: currency.isoCode.toLowerCase(),
                label: `${currency.isoCode} - ${currency.name}`,
                isoCode: currency.isoCode
            };
        });
        this.currencies = currencies.slice(5, currencies.length).map((currency) => {
            return {
                value: currency.isoCode.toLowerCase(),
                label: `${currency.isoCode} - ${currency.name}`,
                isoCode: currency.isoCode
            };
        });
        this.allCurrencies = [
            {
                groupName: '—',
                options: this.get('topCurrencies')
            },
            {
                groupName: '—',
                options: this.get('currencies')
            }
        ];
        this.currencyVal = this.price.currency || 'usd';
        this.periodVal = this.price.interval || 'month';
    }

    get title() {
        if (this.isExistingPrice) {
            return this.intl.t(`portal.Price - {name}`, {name: this.price.nickname || 'No Name'});
        }
        return this.intl.t('portal.New Price');
    }

    get isExistingPrice() {
        return !!this.model.price;
    }

    get currency() {
        return this.price.currency || 'usd';
    }

    get selectedCurrencyObj() {
        return this.currencies.findBy('value', this.price.currency) || this.topCurrencies.findBy('value', this.price.currency);
    }

    // TODO: rename to confirm() when modals have full Glimmer support
    @action
    confirmAction() {
        this.confirm(this.price);
        this.close();
    }

    @action
    close(event) {
        event?.preventDefault?.();
        this.closeModal();
    }

    @task({drop: true})
    *savePrice() {
        this.validatePriceData();
        if (!isEmpty(this.errors) && Object.keys(this.errors).length > 0) {
            return;
        }
        const priceObj = {
            ...this.price,
            amount: (this.price.amount || 0) * 100
        };
        if (!priceObj.id) {
            priceObj.active = 1;
            priceObj.currency = priceObj.currency || 'usd';
            priceObj.interval = priceObj.interval || 'month';
            priceObj.type = 'recurring';
        }
        yield this.confirm(priceObj);
        this.send('closeModal');
    }

    validatePriceData() {
        this.errors = EmberObject.create();
        if (!this.price.nickname) {
            this.errors.set('name', [{
                message: this.intl.t('portal.Please enter name')
            }]);
        }
        if (isNaN(this.price.amount) || this.price.amount === '') {
            this.errors.set('amount', [{
                message: this.intl.t('portal.Please enter amount')
            }]);
        }
        if (!this.price.interval || !['month', 'year'].includes(this.price.interval)) {
            this.errors.set('interval', [{
                message: this.intl.t('portal.Please enter billing interval')
            }]);
        }
    }

    actions = {
        confirm() {
            this.confirmAction(...arguments);
        },
        updatePeriod(oldPeriod, newPeriod) {
            this.price.interval = newPeriod;
            this.periodVal = newPeriod;
        },
        setAmount(amount) {
            this.price.amount = !isNaN(amount) ? parseInt(amount) : 0;
        },

        setCurrency(currency) {
            this.price.currency = currency.value;
            this.currencyVal = currency.value;
        },
        // needed because ModalBase uses .send() for keyboard events
        closeModal() {
            this.close();
        }
    }
}

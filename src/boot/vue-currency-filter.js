// import something here
import VueCurrencyFilter from 'vue-currency-filter'

// "async" is optional
export default async ({ Vue }) => {
  Vue.use(VueCurrencyFilter, {
    symbol : '₱',
    thousandsSeparator: ',',
    fractionCount: 2,
    fractionSeparator: '.',
    symbolPosition: 'front',
    symbolSpacing: true
  })
}

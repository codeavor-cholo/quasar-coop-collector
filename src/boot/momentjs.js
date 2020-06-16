// import something here
import moment from 'moment'

// "async" is optional
export default async ({ Vue }) => {
  // something to do
  Vue.prototype.$moment = moment
}

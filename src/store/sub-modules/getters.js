import { firebaseDb } from 'boot/firebase'


export const getPlainValue = (state) => (dataObject) => {
  var obj = JSON.parse(JSON.stringify(dataObject));
  Object.keys(obj).reduce(function (obj, key) {
    if (obj["_" +  key] === obj[key]) {
      delete obj["_" +  key]
    }
    return obj
  }, obj)
  return obj
}

export const currencyToNumber = (state) => (value) => {
  let val = value.toString()
  return parseInt(val.replace(/\,/g,''))
}

export const formatStringDate = (state) => (dateParam) => {
  let dateVal = new Date(dateParam)
  var month = ('0' + (dateVal.getMonth() + 1)).slice(-2);
  var date = ('0' + dateVal.getDate()).slice(-2);
  var year = dateVal.getFullYear();
  var formattedDate = year + '/' + month + '/' + date;
  return formattedDate
}


export function genTransactionID () {
  return new Promise((resolve) => {
    let query = firebaseDb.collection('Transactions').orderBy('timestamp', 'desc').limit(1)
    query.get().then(snapshot => {
      if (!snapshot.empty) {
        snapshot.forEach(doc => {
          resolve(doc.data().TransactionID)
        })
      } else {
        resolve(null)
      }
    })
  })
}

export function genORNo () {
  return new Promise((resolve) => {
    let query = firebaseDb.collection('Transactions').orderBy('timestamp', 'desc').limit(1)
    query.get().then(snapshot => {
      if (!snapshot.empty) {
        snapshot.forEach(doc => {
          resolve(doc.data().OrNo)
        })
      } else {
        resolve(null)
      }
    })
  })
}

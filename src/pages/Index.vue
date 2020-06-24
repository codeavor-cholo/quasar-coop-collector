<template>
  <q-page class="q-pa-md">
      <div class="text-h6 q-mb-md">Daily Collections <span class="text-teal">( {{$moment(today).format('LL')}} )</span></div> 
      <div class="row q-gutter-md">
          <q-input outlined="" v-model="search" placeholder="Search" class="col">
          <template v-slot:append>
              <q-icon v-if="search === ''" name="search" />
              <q-icon v-else name="clear" class="cursor-pointer" @click="search = ''" />
          </template>
          </q-input> 
          <q-btn color="grey-10" icon="event" label="filter" @click="filterDateDialog = true"/>
      </div>
      <q-list class="q-mt-md" >
        <div v-for="n in filteredItems" :key="n['.key']" v-show="n.MyUnits.length > 0">
          <q-item clickable v-ripple >
            <q-item-section>{{n.FirstName}} {{n.LastName}} 
              <q-item-label caption>
                {{n['.key']}}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              {{checkIfPaidLength(n['.key'])}} / {{n.MyUnits.length}} Paid
            </q-item-section>
          </q-item>
          <q-separator spaced />
          <q-item-label header >Units / Jeeps</q-item-label>   
          <q-item clickable v v-for="unit in n.MyUnits" :key="unit.PlateNumber">
            <q-item-section avatar>
              <q-icon color="teal" name="check_circle" v-show="checkIfPaidForToday(n['.key'],unit.PlateNumber)"/>
            </q-item-section>
            
            <q-item-section>{{unit.PlateNumber}}
              <q-item-label caption v-for="driver in unit.DefaultDrivers" :key="driver['.key']">
                {{driver.FirstName}} {{driver.LastName}} - {{driver['.key']}} <q-badge color="teal" text-color="white" v-show="checkIfPaidForToday(driver['.key'],unit.PlateNumber)"><q-icon name="check_circle" class="q-mr-sm"/> Paid</q-badge>
              </q-item-label>
            </q-item-section>
          </q-item>     
          <q-separator spaced />     
        </div>
      </q-list>

      <q-dialog v-model="filterDateDialog" persistent>
        <q-card class="q-pt-sm">
            <q-date
              v-model="today"
              minimal
              flat
              dense
              today-btn=""
            />
          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="primary" v-close-popup @click="cancelFilter"/>
            <q-btn flat label="Set Date" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
  </q-page>
</template>

<script>
import { firebaseDb, firebaseAuth, firefirestore } from 'boot/firebase'
import { date } from 'quasar'
export default {
  name: 'PageIndex',
  data(){
    return {
      search: '',
      today: date.formatDate(new Date(),'MM/DD/YYYY'),
      filterDateDialog: false,
    }
  },
  firestore(){
      return {
          MemberData: firebaseDb.collection('MemberData'),    
          Transactions: firebaseDb.collection('Transactions'),   
          JeepneyData: firebaseDb.collection('JeepneyData'),           
      }
  },
  computed:{
    filteredItems() {
      return this.returnOperatorFirst.filter(item => {
         let nameID = `${item['.key']}${item.FirstName}${item.LastName}`
         return nameID.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      })
    },
    returnOperatorFirst(){
      try {
        let operators = this.MemberData.filter(a=>{
          return a.Designation == 'Operator'
        })





        operators.forEach(a=>{
          let id = a['.key']
          a.MyUnits = this.getUnits(id)
        })

        console.log(operators,'operators')

        return operators
      } catch (error) {
        console.log(error,'returnOperatorFirst')
        return []
      }
    }
  },
  methods:{
    getDrivers(id,plateKey){
        let drivers = this.MemberData.filter(a=>{
          return a.Designation == 'Driver' && a.Operator.MemberID == id && a.defaultUnit !== undefined && a.defaultUnit.PlateNumber == plateKey
        })
        return drivers
    },
    getUnits(id){
        let units = this.JeepneyData.filter(a=>{
          return a.Status == 'approved' && a.MemberID == id
        })

        units.forEach(a=>{
          a.DefaultDrivers = this.getDrivers(id,a.PlateNumber)
        })

        return units
    },
    checkIfPaidForToday(id,plate){
      let today = date.formatDate(new Date(this.today),'MM-DD-YYYY')
      let payments = this.Transactions.filter(a=>{
        let payDate = date.formatDate(a.timestamp.toDate(),'MM-DD-YYYY')
        return a.MemberID == id && a.jeepneyDetails !== null && a.jeepneyDetails !== undefined && a.jeepneyDetails.PlateNumber == plate && today == payDate
      })

      // console.log(payments,'payments')

      if(payments.length > 0){
        return true
      } else {
        return false
      }
    },
    checkIfPaidLength(id){
      let today = date.formatDate(new Date(this.today),'MM-DD-YYYY')
      let payments = this.Transactions.filter(a=>{
        let payDate = date.formatDate(a.timestamp.toDate(),'MM-DD-YYYY')
        return a.MemberID == id && a.jeepneyDetails !== null && a.jeepneyDetails !== undefined && today == payDate
      })

        // console.log(payments,'payments')
      let uniq = this.$lodash.uniqBy(payments,'jeepneyDetails')
        return uniq.length
    },
    cancelFilter(){
      this.today = date.formatDate(new Date(),'MM/DD/YYYY')
    }
  }
}
</script>

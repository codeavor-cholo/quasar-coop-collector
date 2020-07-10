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
              {{checkIfPaidLength(n['.key'])}} / {{n.MyUnits.length + n.paidNoDefault.length}} Paid
            </q-item-section>
          </q-item>
          <q-separator spaced />
          <q-item-label header >Units / Jeeps</q-item-label>   
          <q-item clickable v-for="unit in n.MyUnits" :key="unit.PlateNumber">
            <q-item-section avatar>
              <q-icon color="teal" name="check_circle" v-show="checkIfPaidForToday(n['.key'],unit.PlateNumber)"/>
            </q-item-section>
            
            <q-item-section>{{unit.PlateNumber}}
              <q-item-label caption v-for="driver in unit.DefaultDrivers" :key="driver['.key']">
                {{driver.FirstName}} {{driver.LastName}} - {{driver['.key']}} <q-badge color="teal" text-color="white" v-show="checkIfPaidForToday(driver['.key'],unit.PlateNumber)"><q-icon name="check_circle" class="q-mr-sm"/> Paid</q-badge>
              </q-item-label>
            </q-item-section>
          </q-item> 

          <q-item-label header v-show="n.paidNoDefault.length>0">Paid Drivers w/o default unit</q-item-label>     
          <q-item clickable v-for="(unit,n) in n.MyUnits" :key="unit.PlateNumber+n" v-show="unit.NoDefaultPaid.length > 0">
            <q-item-section avatar>
              <q-icon color="teal" name="check_circle" v-show="checkIfPaidForToday(n['.key'],unit.PlateNumber)"/>
            </q-item-section>
            
            <q-item-section>{{unit.PlateNumber}}
              <q-item-label caption v-for="driver in unit.NoDefaultPaid" :key="driver['.key']">
                {{driver.FirstName}} {{driver.LastName}} - {{driver['.key']}} <q-badge color="teal" text-color="white" v-show="checkIfPaidForToday(driver['.key'],unit.PlateNumber)"><q-icon name="check_circle" class="q-mr-sm"/> Paid</q-badge>
              </q-item-label>
            </q-item-section>
          </q-item>  
          <q-item-label header v-show="n.DriverWithoutUnits.length > 0">Drivers w/o default unit</q-item-label>   
          <q-item clickable v-for="driver in n.DriverWithoutUnits" :key="driver['.key']">
            <q-item-section avatar>
             
            </q-item-section>   
            <q-item-section>
              <q-item-label caption>
                {{driver.FirstName}} {{driver.LastName}} - {{driver['.key']}} 
                <!-- <q-badge color="teal" text-color="white" v-show="checkIfPaidForToday(driver['.key'],unit.PlateNumber)"><q-icon name="check_circle" class="q-mr-sm"/> Paid</q-badge> -->
              </q-item-label>
            </q-item-section>
          </q-item>  
          <q-separator spaced />     
        </div>
      </q-list>

      <q-dialog v-model="filterDateDialog" persistent>
        <q-card>
            <q-date
              v-model="today"
              flat
              today-btn=""
              :options="dateOptions"
            />
          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="primary" v-close-popup @click="cancelFilter"/>
            <q-btn flat label="Set Date" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="scanForAttendance" persistent maximized="">
        <q-card class="q-pa-md" style="width:90vw;height:auto;">
          <div class="q-mt-md q-pa-md full-width" v-if="scanner">
              <qrcode-stream class="full-width" style="width: 200px; height: 200px;" @decode="onDecode"></qrcode-stream>
          </div>    
          <div v-else>
            <div class="text-h6 row justify-between q-mb-md">
            <div>Member Details</div> 
            <div><q-chip label="Remove Selected" size="md" color="red" text-color="white" removable="" @remove="removeMemberDetails" v-show="MDetails.memberID !== ''"/></div>

            </div>
            <q-list>
                <div class="text-weight-bold text-teal bg-grey-2 q-py-md">
                    <q-item>
                        <q-item-section>
                            <q-item-label caption lines="2">Member ID</q-item-label>
                            <q-item-label>{{MDetails.memberID}}</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-separator spaced inset />
                    <q-item>
                        <q-item-section avatar>
                        <q-avatar color="teal" text-color="white" class="text-weight-regular">{{MDetails.memberName.charAt(0).toUpperCase()}}</q-avatar>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="text-capitalize">{{MDetails.memberName}}</q-item-label>
                            <q-item-label caption lines="2">{{MDetails.memberDesignation}}</q-item-label>
                        </q-item-section>
                        <q-item-section side v-show="MDetails.isNewMember">
                        <q-item-label class="row" caption><q-icon name="star" color="amber"/> NEW MEMBER</q-item-label>
                        </q-item-section>
                    </q-item>
                </div>
            </q-list>            
          </div>      
          <q-card-section  v-show="scanner">
            <q-banner class="bg-warning text-white q-mb-md" >
                <q-icon name="warning" /> Please scan a Member ID.
            </q-banner> 
           <q-btn flat label="Cancel" color="grey" v-close-popup/>
          </q-card-section>
          <q-card-actions align="center" vertical v-show="!scanner">
            <q-btn flat label="Cancel" color="grey" v-close-popup/>
            <q-btn flat label="Report Violation" color="red" v-close-popup />
            <q-btn flat label="Pay Later" color="warning" v-close-popup @click="payLater(MDetails.memberID)"/>
             <q-btn flat label="Pay Now" color="teal" v-close-popup @click="payNow(MDetails.memberID)"/>
          </q-card-actions>
        </q-card>
      </q-dialog>


      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn round color="teal" icon="qr_code" size="lg" @click="scanForAttendance = true,scanner = true"/>
      </q-page-sticky>

  </q-page>
</template>

<script>
import { firebaseDb, firebaseAuth, firefirestore } from 'boot/firebase'
import { date } from 'quasar'
import Vue from "vue";
import VueQrcodeReader from "vue-qrcode-reader";
import money from 'v-money'
import { mapGetters } from 'vuex'
Vue.use(money, {precision: 4})

Vue.use(VueQrcodeReader);
export default {
  name: 'PageIndex',
  data(){
    return {
      scanner: false,
      scanForAttendance: false,
      search: '',
      today: date.formatDate(new Date(),'MM/DD/YYYY'),
      filterDateDialog: false,
      MDetails:{
          memberID: '',
          memberName: '',
          memberDesignation: '',
          isNewMember: false,
          operator: ''
      },
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

          let unitsNoDefault = this.getAllPaidInUnits(this.getUnits(id)) == undefined ? [] : this.getAllPaidInUnits(this.getUnits(id))
          let driverWithoutUnits = this.getDriversWithoutDefault(id)
          a.paidNoDefault = unitsNoDefault
          console.log(unitsNoDefault,'unitsNoDefault')
          console.log(driverWithoutUnits,'driverWithoutUnits')

          a.DriverWithoutUnits = this.checkIfAvailableIn2Arrays(unitsNoDefault,driverWithoutUnits)
        })

        console.log(operators,'returnOperatorFirst')

        return operators
      } catch (error) {
        console.log(error,'returnOperatorFirst')
        return []
      }
    }
  },
  methods:{
    getAllPaidInUnits(units){
      let allPaid = []
      units.forEach(a=>{
        if(a.NoDefaultPaid.length > 0){
          a.NoDefaultPaid.forEach(x=>{
            allPaid.push(x)
          })
        }
      })
      return allPaid
    },
    checkIfAvailableIn2Arrays(unitsNoDefault,driverWithoutUnits){
      let paid = unitsNoDefault
      let unpaid = []

      driverWithoutUnits.forEach(a=>{
        let index = this.$lodash.findIndex(paid,b=>{
          return a['.key'] == b['.key']
        })

        console.log(index,'checkIfAvailableIn2Arrays'+ a.FirstName)

        if(index < 0) unpaid.push(a)
      })

      return unpaid
    },
    getDriversWithoutDefault(id){
      try {
        let driver = this.MemberData.filter(a=>{
          return a.Designation == 'Driver' && a.Operator.MemberID == id && a.defaultUnit == undefined
        })

        return driver == undefined ? [] : driver
      } catch (error) {
        console.log(error,'error')
        return []
      }
    },
      removeMemberDetails(){
          this.MDetails.memberID = ''
          this.MDetails.memberName = ''
          this.MDetails.memberDesignation = ''
          this.MDetails.isNewMember = false
          this.scanner = true
      },
    changeMemberDetails(val){
        
        let member = this.MemberData.filter(d => {
        return d['.key'] === val.id
        })[0]

        // console.log(val.trackingNumber,'val.trackingNumber')

        // if(val.trackingNumber !== undefined){
        //     this.trackingNumber = val.trackingNumber
            
        //     if(val.billType !== undefined){
        //         this.billPaymentView = true
        //         console.log(this.model2,'billing details')
        //     } else {
        //         this.billPaymentView = false
        //     }
        // }

        // if(member.Advances !== 0 || member.Advances !== undefined){
        //     this.hasCA = true
        //     this.AdvanceSelect = this.returnMapActiveLoans.map(a=>{return a.value})
        //     let sum = this.$lodash.sumBy(member.activeLoans,a=>{return parseInt(a.DailyCharge)})
        //     this.ca = sum
            
        // } else {
        //     this.hasCA = false
        // }

        // if(member.defaultUnit !== undefined){
        //     let jeep = member.defaultUnit
        //     this.MDetails.defaultUnit = jeep.PlateNumber
        //     this.jeepneyDetails = jeep.PlateNumber
        //     this.defaultUnitDisabled = true
        //     this.defaultUnit = true
        //     console.log(this.jeepneyDetails,'jeep default')
        // } else {
        //     this.MDetails.defaultUnit = null
        //     this.defaultUnitDisabled = false
        //     this.defaultUnit = false
        //     this.jeepneyDetails = null
        // }

        if(val !== null){
            this.MDetails.memberID = val.id
            this.MDetails.memberName = `${member.LastName} ${member.FirstName}`
            this.MDetails.memberDesignation = member.Designation
            this.MDetails.isNewMember = member.isNewMember
            this.MDetails.operator = member.Operator
            



            // let sumAdvances = this.$lodash.sumBy(member.activeLoans,a=>{
            //     let sum = 0
            //     if(a.TotalBalance == undefined){
            //         sum = (parseFloat(a.toPayAmount) - parseFloat(a.paidAmount))
            //     } else {
            //         sum = (parseFloat(a.TotalBalance) - parseFloat(a.paidAmount))
            //     }
            //     return sum
            // })

            // console.log(sumAdvances,'sumAdvances')


            // this.MDetails.advances = sumAdvances
            // this.MDetails.activeLoans = member.activeLoans
            // this.hasCA = member.Advances > 0

            // if(member.isNewMember){
            //     this.membershipFee = this.MembershipFee.amount
            // }
            
            // if(member.Designation === 'Driver'){
            //     this.mf1 = this.ManagementFeeDriver.amount
            //     this.ss1 = this.ShareOfStocks.amount
            //     this.mf2 = this.ManagementFeeOperator.amount
            //     this.ss2 = this.ShareOfStocks.amount   
            //     this.ifDriver = true
            //     this.driverOperator = member.Operator
            // } else {
            //     this.mf1 = this.ManagementFeeOperator.amount
            //     this.ss1 = this.ShareOfStocks.amount     
            //     this.ifDriver = false   
            //     this.driverOperator = {}             
            // }

        }
    },
    onDecode (decodedString) {
        console.log(decodedString,'on decode')
        this.changeMemberDetails({id: decodedString})
        this.scanner = false
    },
    getDrivers(id,plateKey){
        let drivers = this.MemberData.filter(a=>{
          return a.Designation == 'Driver' && a.Operator.MemberID == id && a.defaultUnit !== undefined && a.defaultUnit.PlateNumber == plateKey
        })
        return drivers
    },
    getUnits(id){
      try {
         let units = this.JeepneyData.filter(a=>{
          return a.Status == 'approved' && a.MemberID == id
        })

        units.forEach(a=>{
          a.DefaultDrivers = this.getDrivers(id,a.PlateNumber),
          a.NoDefaultPaid = this.getPaidUnitofNotDefault(id,a.PlateNumber)
        })

        return units == undefined ? [] : units    
      } catch (error) {
        return []
      }

    },
    getPaidUnitofNotDefault(id,plateKey){
      let withoutDefault = this.getDriversWithoutDefault(id)

      let someonePaid = []
      withoutDefault.forEach(a=>{
        if(this.checkIfPaidForToday(a['.key'],plateKey)){
          someonePaid.push(a)
        }
      })
      // console.log(someonePaid,'someonePaid')
      return someonePaid
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
    },
    dateOptions(dates){
      console.log(dates,'dates')
      return new Date(dates) <= new Date()
    },
    payNow(id){
      this.$router.push(`/addpaymentcopy/${id}`)
    }
  }
}
</script>

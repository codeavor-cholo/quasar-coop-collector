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

      <div class="text-center q-mt-md text-grey"> Click item to create transaction.</div>
      <q-list class="q-mt-md" >
        <div v-for="n in filteredItems" :key="n['.key']" v-show="n.MyUnits.length > 0">
          <q-item v-ripple >
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

          <div v-for="unit in n.MyUnits" :key="unit.PlateNumber">
            <q-item :clickable="unit.DefaultDrivers.length == 0" @click="clickListForAttendance(n['.key'],unit.PlateNumber,null,checkIfPaidLength(n['.key']),n.MyUnits.length + n.paidNoDefault.length)">
              <q-item-section avatar v-if="unit.DefaultDrivers.length > 0">
              </q-item-section>
              <q-item-section avatar v-else>
                  <q-icon color="teal" name="check_circle" v-show="checkIfPaidForToday(n['.key'],unit.PlateNumber) && checkIfPaidForLaterToday(n['.key'],unit.PlateNumber) == false"/>
                  <q-icon color="warning" name="warning" v-show="checkIfPaidForLaterToday(n['.key'],unit.PlateNumber) && checkIfPaidForToday(n['.key'],unit.PlateNumber)  == false"/>
              </q-item-section>
              <q-item-section>
                {{unit.PlateNumber}}
              </q-item-section>
              
            </q-item> 
            <q-item :clickable="checkIfPaidForToday(n['.key'],unit.PlateNumber) == false" v-for="driver in unit.DefaultDrivers" :key="driver['.key']" @click="clickListForAttendance(n['.key'],unit.PlateNumber,driver,checkIfPaidLength(n['.key']),n.MyUnits.length + n.paidNoDefault.length)">
              <q-item-section avatar>
                <q-icon color="teal" name="check_circle" v-show="checkIfPaidForToday(n['.key'],unit.PlateNumber)"/>
                <q-icon color="warning" name="warning" v-show="checkIfPaidForLaterToday(n['.key'],unit.PlateNumber)"/>
              </q-item-section>
              
              <q-item-section>
                <q-item-label caption >
                  {{driver.FirstName}} {{driver.LastName}} - {{driver['.key']}} <q-badge color="teal" text-color="white" v-show="checkIfPaidForToday(driver['.key'],unit.PlateNumber) && checkIfPaidForLaterToday(n['.key'],unit.PlateNumber) == false"><q-icon name="check_circle" class="q-mr-sm"/> Paid</q-badge> 
                  <q-badge color="warning" text-color="white" v-show="checkIfPaidForLaterToday(driver['.key'],unit.PlateNumber) && checkIfPaidForToday(n['.key'],unit.PlateNumber)  == false"><q-icon name="warning" class="q-mr-sm"/> Unpaid</q-badge> 
                </q-item-label>
              </q-item-section>
            </q-item>             
          </div>



          <q-item-label header v-show="n.paidNoDefault.length>0">Paid Drivers w/o default unit</q-item-label>     
          <q-item v-for="(unit,n) in n.MyUnits" :key="unit.PlateNumber+n" v-show="unit.NoDefaultPaid.length > 0">
            <q-item-section avatar>
              <q-icon color="teal" name="check_circle" v-show="checkIfPaidForToday(n['.key'],unit.PlateNumber)"/>
              <q-icon color="warning" name="warning" v-show="checkIfPaidForLaterToday(n['.key'],unit.PlateNumber)"/>
            </q-item-section>
            
            <q-item-section>{{unit.PlateNumber}}
              <q-item-label caption v-for="driver in unit.NoDefaultPaid" :key="driver['.key']">
                {{driver.FirstName}} {{driver.LastName}} - {{driver['.key']}} <q-badge color="teal" text-color="white" v-show="checkIfPaidForToday(driver['.key'],unit.PlateNumber) && checkIfPaidForLaterToday(n['.key'],unit.PlateNumber) == false"><q-icon name="check_circle" class="q-mr-sm"/> Paid</q-badge>
                 <q-badge color="warning" text-color="white" v-show="checkIfPaidForLaterToday(driver['.key'],unit.PlateNumber) && checkIfPaidForToday(n['.key'],unit.PlateNumber)  == false"><q-icon name="warning" class="q-mr-sm"/> Unpaid</q-badge> 
              </q-item-label>
            </q-item-section>
          </q-item>  


          <q-item-label header v-show="n.DriverWithoutUnits.length > 0">Drivers w/o default unit</q-item-label>   
          <q-item clickable v-for="driver in n.DriverWithoutUnits" :key="driver['.key']"  @click="clickListForAttendance(n['.key'],null,driver,checkIfPaidLength(n['.key']),n.MyUnits.length + n.paidNoDefault.length)">
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
          <q-card-section  v-show="!scanner && checkIfThereIsUnit(MDetails.memberID) == false">
            <q-banner class="bg-warning text-white" >
                <q-icon name="warning" /> You have no units.
            </q-banner> 
          </q-card-section>
          <q-card-actions align="center" vertical v-if="!scanner && checkIfThereIsUnit(MDetails.memberID) == true">
            
            <!-- <q-btn flat label="Report Violation" color="red" v-close-popup /> -->
            <q-btn flat label="Pay Later" color="warning" v-close-popup @click="payLater(MDetails.memberID)" v-show="checkIfPaidForLaterToday(MDetails.memberID,clickPlate) == false"/>
             <q-btn flat label="Pay Now" color="teal" v-close-popup @click="payNow(MDetails.memberID)"/>
             <q-btn flat label="Cancel" color="grey" v-close-popup/>
          </q-card-actions>
          <q-card-actions align="center" vertical v-else>
              <q-btn flat label="Cancel" color="grey" v-close-popup/>
          </q-card-actions>
        </q-card>
      </q-dialog>


      <q-dialog v-model="clickForAttendance" persistent maximized="">
        <q-card class="q-pa-md" style="width:90vw;height:auto;">
          <div class="q-mt-md q-pa-md full-width" v-if="clicked">
              
          </div>    
          <div v-else>
            <div class="text-h6 row justify-between q-mb-md">
            <div>Member Details</div> 
            <!-- <div><q-chip label="Remove Selected" size="md" color="red" text-color="white" removable="" @remove="removeMemberDetails" v-show="MDetails.memberID !== ''"/></div> -->

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
                    <q-item v-show="clickPlate !== null">
                      <q-item-section top avatar>
                        <q-avatar color="teal" text-color="white" icon="commute" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{clickPlate}}</q-item-label>
                      </q-item-section>
                    </q-item>
                </div>
            </q-list>            
          </div>      
          <q-card-section  v-show="clicked">
            <q-banner class="bg-warning text-white" >
                <q-icon name="warning" /> Please select a Member.
            </q-banner> 
          </q-card-section>
          <q-card-section  v-show="checkIfPaidForLaterToday(MDetails.memberID,clickPlate)">
            <q-banner class="bg-warning text-white" >
                <q-icon name="warning" /> You have a unpaid payables for today.
            </q-banner> 
          </q-card-section>
          <q-card-actions align="center" vertical v-show="!clicked">
            <!-- <q-btn flat label="Report Violation" color="red" v-close-popup /> -->
            <q-btn flat label="Pay Later" color="warning" v-close-popup @click="payLater(MDetails.memberID)" v-show="checkIfPaidForLaterToday(MDetails.memberID,clickPlate) == false"/>
            <q-btn flat label="Pay Now" color="teal" v-close-popup @click="payNow(MDetails.memberID)"/>
            <q-btn flat label="Cancel" color="grey" v-close-popup/>
            <!-- <q-btn flat label="Pay Now (Include Operator)" color="teal" v-close-popup @click="payNow(MDetails.memberID)" v-show="clickDriver !== null"/> -->
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <!-- scanForAttendance = true,scanner = true -->
        <q-btn round color="teal" icon="qr_code" size="lg" @click="scanQROpen" v-if="$q.platform.is.cordova"/>
        <q-btn round color="teal" icon="qr_code" size="lg" @click="scanForAttendance = true,scanner = true " v-else/>

      </q-page-sticky>

  </q-page>
</template>

<script>
import { firebaseDb, firebaseAuth, firefirestore } from 'boot/firebase'
import { date } from 'quasar'
import Vue from "vue";
import VueQrcodeReader from "vue-qrcode-reader";
import axios from 'axios'

import money from 'v-money'
import { mapGetters } from 'vuex'
Vue.use(money, {precision: 4})

Vue.use(VueQrcodeReader);
var readyDevice = false

document.addEventListener('deviceready', () => {
  // it's only now that we are sure
  // the event has triggered
  console.log('deviceReadyNow')
  readyDevice = true
}, false)



export default {
  name: 'PageIndex',
  data(){
    return {
      // deviceReady: false,
      cordovaQRresult: null,
      clicked: false,
      clickForAttendance: false,
      clickPlate: null,
      clickDriver: null,
      scanner: false,
      scanForAttendance: false,
      search: '',
      today: new Date(),
      filterDateDialog: false,
      MDetails:{
          memberID: '',
          memberName: '',
          memberDesignation: '',
          isNewMember: false,
          operator: '',
          phoneNumber: ''
      },
      ifAllPaid: false,
    }
  },
  firestore(){
      return {
          MemberData: firebaseDb.collection('MemberData'),    
          Transactions: firebaseDb.collection('Transactions'),   
          PayLater: firebaseDb.collection('PayLater'),
          JeepneyData: firebaseDb.collection('JeepneyData'),   
          ManagementFeeDriver: firebaseDb.collection('FixedPayments').doc('ManagementFeeDriver'),
          ManagementFeeOperator: firebaseDb.collection('FixedPayments').doc('ManagementFeeOperator'),
          ShareOfStocks: firebaseDb.collection('FixedPayments').doc('ShareOfStocks')    
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
          this.MDetails.operator = null
          this.scanner = true
      },
    changeMemberDetails(val){
        
        let member = this.MemberData.filter(d => {
        return d['.key'] === val.id
        })[0]

        console.log(member,'member data')
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
            this.MDetails.phoneNumber = member.Phone
            
            



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
        this.clickPlate = 'NONE'
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
    checkIfPaidForLaterToday(id,plate){
      let today = date.formatDate(new Date(this.today),'MM-DD-YYYY')
      let payments = this.PayLater.filter(a=>{
        let payDate = date.formatDate(a.timestamp.toDate(),'MM-DD-YYYY')
        return a.memberID == id && a.plateNumber !== null && a.plateNumber !== undefined && a.plateNumber == plate && today == payDate
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
      this.today = new Date()
    },
    dateOptions(dates){
      console.log(dates,'dates')
      return new Date(dates) <= new Date()
    },
    clickListForAttendance(id,plate = null,driver = null,count = 0,allunits = 0){
      console.log(count,allunits,'yeah')
      console.log(id,plate,driver)

      if(count >= allunits){
        this.ifAllPaid = true
      }


      if(driver == null){
        this.clickForAttendance = true
        this.clicked = false
        this.clickPlate = plate == null ? 'NONE' : plate
        this.changeMemberDetails({id: id})
        
      } else {
        this.clickForAttendance = true
        this.clicked = false
        this.clickPlate = plate == null ? 'NONE' : plate
        this.changeMemberDetails({id: driver['.key']})
        this.clickDriver = driver
      }
      

    },
    payNow(id){
      this.$router.push(`/addpaymentcopy/${id}&${this.clickPlate}`)
    },
    payLater(id){
      //saves to pay later (as attendance)
      //send sms to notify that this will be added to the billing if unpaid within the day
      //what needs to be saved

      let payLater = {
        memberID: id,
        plateNumber: this.clickPlate,
        ifPaidTodayMF: this.MDetails.memberDesignation == 'Driver' ? this.ManagementFeeDriver.amount : this.ManagementFeeOperator.amount,
        ifPaidTodaySS: this.ShareOfStocks.amount,
        amountToPayBilling: this.MDetails.memberDesignation == 'Driver' ? this.ManagementFeeDriver.amount : this.ManagementFeeOperator.amount,
        timestamp: firefirestore.FieldValue.serverTimestamp(),
      }

      let opsID = this.MDetails.operator == undefined || this.MDetails.operator == null ? '' : this.MDetails.operator.MemberID

      let payLaterOperator = {
        memberID: opsID,
        plateNumber: this.clickPlate,
        ifPaidTodayMF: this.ManagementFeeOperator.amount,
        ifPaidTodaySS: this.ShareOfStocks.amount,
        amountToPayBilling: this.ManagementFeeOperator.amount,
        timestamp: firefirestore.FieldValue.serverTimestamp(),        
      }

      if(this.clickPlate == 'NONE' || this.clickPlate == null){

        this.$q.dialog({
          title: 'Jeepney Plate Number',
          message: 'Choose a jeep / unit:',
          options: {
            type: 'radio',
            model: 'opt1',
            // inline: true
            items: this.getUnitsOfOperator(this.MDetails.operator.MemberID)
          },
          cancel: true,
          persistent: true
        }).onOk(data => {
          console.log('>>>> OK, received', data)
            payLater.plateNumber = data
            payLaterOperator.plateNumber = data
            this.payLaterSaving(payLater)
            this.payLaterSaving(payLaterOperator)

        }).onCancel(() => {
          // console.log('>>>> Cancel')
          this.clickForAttendance = true
        }) 
      } else {
        if(this.MDetails.memberDesignation == 'Driver'){
          if(this.ifAllPaid == false){
            // sama mo operator
            this.payLaterSaving(payLater)
            this.payLaterSaving(payLaterOperator)
          } else {
            // dont
            this.payLaterSaving(payLater)
          }
        } else {
          this.payLaterSaving(payLater)
        }
      }
    },
    payLaterSaving(data){
      firebaseDb.collection('PayLater').add(data)
      .then(() =>{
        this.sendSMS(data)
        this.$q.notify({
          icon: 'info',
          color: 'positive',
          message: 'Pay Later Data Saved!'
        })        
      })
    },
    getUnitsOfOperator(operatorID){
      let filter = this.JeepneyData.filter(a=>{
          return a.MemberID == operatorID && a.Status == 'approved'
      })

      console.log('filter',filter)
      let map = filter.map(a=>{
          return {
              value: a.PlateNumber,
              label: a.PlateNumber,
              unitData: a
          }
      })
      console.log('jeep data',map)
      return map      
    },
    sendSMS(paylater){
          let number = this.getMobileNumber(paylater.memberID)
          let TodayDate = date.formatDate(new Date(), 'YYYY-MM-DD hh:mm A')
          let header= {
                  'Access-Control-Allow-Origin': '*',
          }
          let message = `You have P ${paylater.amountToPayBilling}.00 payable for today. If unpaid today, this will reflect in your monthly billing.`
          let apinumber = 4

          let data = 'number=' + number + '&' + 'message=' + message + '&' + 'apinumber=' + apinumber
          console.log(data,'data sent')

          const options = {
              method: 'POST',
              headers: { 'Access-Control-Allow-Origin': '*' },
              data: data,
              url: 'https://smsapisender.000webhostapp.com/index.php',
          }      

          axios.post('https://toned-tabulation.000webhostapp.com/index.php', data)
          .then(response => {
          console.log(response)
          })
          .catch((error) => {
          console.log(error.response)
          })            
    },
    getMobileNumber(id){
        try {
          return this.MemberData.filter(a=>{
              return a['.key'] == id
          })[0].Phone
        } catch (error) {
            console.log(error,'error getting number')
            return 0
        }
    },
    scanCordova(){

    },
    checkIfThereIsUnit(id){
        if(this.MDetails.memberID == '') return false

        let units = []
        console.log(this.MDetails)
        if(this.MDetails.memberDesignation == 'Driver'){
            units = this.getUnitsOfOperator(this.MDetails.operator.MemberID)
        } else {
            units = this.getUnitsOfOperator(this.MDetails.memberID)
        }
        console.log(units,'units')
        if(units.length > 0){
            return true
        } else {
            return false
        }
    },
    scanQROpen(){
      var resultQR = null
      let self = this
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            // alert("We got a barcode\n" +
            //       "Result: " + result.text + "\n" +
            //       "Format: " + result.format + "\n" +
            //       "Cancelled: " + result.cancelled);
            resultQR = result.text
            self.cordovaQRresult = result.text
            // self.$q.notify({
            //   icon: 'info',
            //   color: 'positive',
            //   message: result.text
            // })    
            self.scanForAttendance = true
            self.onDecode(result.text)

        },
        function (error) {
            alert("Scanning failed: " + error);
        },
        {
            preferFrontCamera : false, // iOS and Android
            showFlipCameraButton : false, // iOS and Android
            showTorchButton : false, // iOS and Android
            torchOn: false, // Android, launch with the torch switched on (if available)
            saveHistory: false, // Android, save scan history (default false)
            prompt : "Place a barcode inside the scan area", // Android
            resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
            orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations : true, // iOS
            disableSuccessBeep: false // iOS and Android
        }
    );




    },
  }
}
</script>

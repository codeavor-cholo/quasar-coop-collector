<template>
    <q-page class="q-pa-md">
      <div class="text-h6 q-mb-md">Daily Monitoring <span class="text-teal">( {{$moment(today).format('LL')}} )</span></div> 
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
      <q-list class="q-mt-md q-mb-xl">
          <q-item clickable v-ripple v-for="member in filteredItems" :key="member['.key']" @click="clickListForAttendance(member['.key'])">
              <q-item-section avatar>
                  <q-icon color="teal" name="check_circle" v-if="member.StatusOfPaymentToday == 'Paid'" />
                  <q-icon color="warning" name="warning" v-else-if="member.StatusOfPaymentToday == 'UnPaid'"/>
                   <q-icon color="grey-2" name="person" v-else/>
              </q-item-section>
              <q-item-section class="text-capitalize">{{`${member.FirstName} ${member.LastName} - ${member['.key']}`}}</q-item-section>
          </q-item>
      </q-list>



      <!-- DIALOGs -->
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
                </div>
            </q-list>            
          </div>      
          <q-card-section  v-show="checkIfThereIsUnit(MDetails.memberID) == false">
            <q-banner class="bg-warning text-white" >
                <q-icon name="warning" /> You have no units.
            </q-banner> 
          </q-card-section>
          <q-card-section v-show="MDetails.StatusOfPaymentToday == 'UnPaid'">
            <q-banner class="bg-warning text-white" >
                <q-icon name="warning" /> You have a unpaid payables for today.
            </q-banner> 
          </q-card-section>
          <q-card-actions align="center" vertical v-if="!clicked && checkIfThereIsUnit(MDetails.memberID) == true">
            <!-- <q-btn flat label="Report Violation" color="red" v-close-popup /> -->
            <q-btn flat label="Pay Later" color="warning" v-close-popup @click="payLater(MDetails.memberID)" v-show="MDetails.StatusOfPaymentToday !== 'UnPaid' && MDetails.StatusOfPaymentToday !== 'Paid'"/>
            <q-btn flat label="Pay Now" color="teal" v-close-popup @click="payNow(MDetails.memberID)" v-show="MDetails.StatusOfPaymentToday !== 'Paid'"/>
            <q-btn flat label="Cancel" color="grey" v-close-popup/>
            <!-- <q-btn flat label="Pay Now (Include Operator)" color="teal" v-close-popup @click="payNow(MDetails.memberID)" v-show="clickDriver !== null"/> -->
          </q-card-actions>
          <q-card-actions align="center" vertical v-else>
              <q-btn flat label="Cancel" color="grey" v-close-popup/>
          </q-card-actions>
        </q-card>
      </q-dialog>


      <q-page-sticky position="bottom" :offset="[18,18]" expand>
        <q-btn-toggle
            class="bg-white"
            v-model="model"
            toggle-color="teal"
            :options="[
                {label: 'All', value: 'All'},
                {label: 'No Show', value: 'NoShow'},
                {label: 'Paid', value: 'Paid'},
                {label: 'Unpaid', value: 'UnPaid'}
            
            ]"
        />
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





export default {
    data(){
        return{
            clicked: false,
            clickForAttendance: false,
            clickPlate: null,
            clickDriver: null,
            model: 'All',
            search: '',
            today: date.formatDate(new Date(),'MM/DD/YYYY'),
            filterDateDialog: false,
            MDetails:{
                memberID: '',
                memberName: '',
                memberDesignation: '',
                isNewMember: false,
                operator: '',
                phoneNumber: '',
                StatusOfPaymentToday: 'NoShow'
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
        return this.getDataBaseOnFilter.filter(item => {
            let nameID = `${item['.key']}${item.FirstName}${item.LastName}`
            return nameID.toLowerCase().indexOf(this.search.toLowerCase()) > -1
        })
        },
        getDataBaseOnFilter(){
            try {


                let members = this.MemberData.filter(a=>{
                    return a.isNewMember == false
                })

                members.forEach(a=>{
                    let today = date.formatDate(new Date(this.today),'MM/DD/YYYY')
                    let filter = this.Transactions.filter(b=>{
                        return b.MemberID == a['.key'] && today == date.formatDate(new Date(b.timestamp.toDate()),'MM/DD/YYYY')
                    })

                    // console.log(filter,'filter')

                    a.StatusOfPaymentToday = filter.length > 0 ? 'Paid' : 'NoShow'

                    let later = this.PayLater.filter(c=>{
                        return c.memberID == a['.key'] && today == date.formatDate(new Date(c.timestamp.toDate()),'MM/DD/YYYY')
                    })

                    if(later.length > 0){
                        a.StatusOfPaymentToday = 'UnPaid'
                    }

                })
                console.log(members,'members')
                if(this.model == 'UnPaid'){
                    return members.filter(a=>{
                        return a.StatusOfPaymentToday == 'UnPaid'
                    })
                } 
                else if(this.model == 'Paid')
                {
                    return members.filter(a=>{
                        return a.StatusOfPaymentToday == 'Paid'
                    })
                } 
                else if(this.model == 'NoShow'){
                    return members.filter(a=>{
                        return a.StatusOfPaymentToday == 'NoShow'
                    })                   
                } else { 
                    return this.$lodash.orderBy(members,'StatusOfPaymentToday','desc')
                }

            } catch (error) {
                console.log(error,'getDataBaseOnFilter')
            }
        }
    },
    methods:{
        dateOptions(dates){
            // console.log(dates,'dates')
            return new Date(dates) <= new Date()
        },
        cancelFilter(){
            this.today = date.formatDate(new Date(),'MM/DD/YYYY')
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
            
            let member = this.getDataBaseOnFilter.filter(d => {
            return d['.key'] === val.id
            })[0]

            console.log(member,'member data')

            if(val !== null){
                this.MDetails.memberID = val.id
                this.MDetails.memberName = `${member.LastName} ${member.FirstName}`
                this.MDetails.memberDesignation = member.Designation
                this.MDetails.isNewMember = member.isNewMember
                this.MDetails.operator = member.Operator
                this.MDetails.phoneNumber = member.Phone
                this.MDetails.StatusOfPaymentToday = member.StatusOfPaymentToday
            }
        },
        clickListForAttendance(id,plate = null){
            this.clickForAttendance = true
            this.clicked = false
            this.clickPlate = plate == null ? 'NONE' : plate
            this.changeMemberDetails({id: id})            
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
        checkIfThereIsUnit(id){
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

    }
}
</script>
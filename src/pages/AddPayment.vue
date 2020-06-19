<template>
    <q-page>
        <q-stepper
            v-model="step"
            color="teal-4"
            animated
            ref="stepper"
            class="q-pa-none"
            active-color="teal-4"
            flat=""
            contracted=""
        >
            <q-step
                :name="1"
                title="Select campaign settings"
                icon="account_circle"
                :done="step > 1"
            >       
                    <div v-if="MDetails.memberID == ''">
                    <q-banner class="bg-warning text-white q-mb-md" >
                        <q-icon name="warning" /> Please select a member.
                    </q-banner>  

                    <div class="text-h6 text-center full-width q-mb-md">Search Member</div>
                    <q-select 
                        v-model="model" 
                        :options="membersIdOpt" 
                        :disable="model2 != null"
                        label="Search Member" 
                        filled 
                        input-debounce="0"
                        use-input
                        color="grey-10"
                        use-chips
                        clearable=""
                        behavior="menu"
                        @new-value="createValue"
                        @filter="filterFn"
                        @input="changeMemberDetails"
                        @clear="removeMemberDetails"
                    >

                        <template v-slot:selected-item="scope">
                            <q-chip
                                dense
                                :tabindex="scope.tabindex"
                                color="white"
                                text-color="secondary"
                                class="q-ma-none ellipsis"
                            >
                                {{ scope.opt.label }}
                            </q-chip>
                        </template>
                    </q-select>
                    <div class="q-mt-md full-width" v-if="scanner">
                        <div>
                            <qrcode-stream class="full-width" style="width: 200px; height: 200px;" @decode="onDecode"></qrcode-stream>
                        </div>
                    </div>
                    <q-btn class="q-my-md full-width" color="grey-10" :icon="scanner == true ? 'close' : 'center_focus_weak'" :label="scanner == true ? 'close qr' : 'scan qr'" size="lg" @click="scanner=!scanner" :disable="model2 != null"/>     
                    <div class="text-h6 text-center full-width q-my-md">Search Tracking Number</div>         
                    <q-select 
                        :disable="model != null"
                        v-model="model2" 
                        :options="membersIdOptTracking" 
                        label="Search Tracking Number" 
                        filled 
                        input-debounce="0"
                        use-input
                        color="grey-10"
                        use-chips
                        behavior="dialog"
                        clearable=""
                        @new-value="createValue2"
                        @filter="filterFn2"
                        @input="changeMemberDetails"
                        @clear="removeMemberDetails"
                    >
                        <template v-slot:selected-item="scope">
                            <q-chip
                                dense
                                :tabindex="scope.tabindex"
                                color="white"
                                text-color="secondary"
                                class="q-ma-none"
                            >
                                {{ scope.opt.label }}
                            </q-chip>
                        </template>
                    </q-select>
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
                        <div class="text-h6 q-my-md">Transaction Details</div>
                        <q-list>
                        <div class="text-weight-bold text-teal bg-grey-2 q-py-md">
                            <q-item>
                                <q-item-section>
                                    <q-item-label caption lines="2">Transaction ID</q-item-label>
                                    <q-item-label> {{ TransactionID }} </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-separator spaced inset />
                            <q-item>
                                <q-item-section>
                                    <q-item-label caption lines="2">Reciept ID</q-item-label>
                                    <q-item-label> {{ OrNo }} </q-item-label>
                                </q-item-section>
                            </q-item>
                        </div>

                        </q-list>
                    </div>    
                <q-stepper-navigation class="text-right">
                    <q-btn @click="$refs.stepper.next()" color="teal" icon-right="arrow_right" :label="step === 2 ?'Finish' : 'Continue'" :disable="MDetails.memberID == ''"/>
                </q-stepper-navigation>                    
            </q-step>
            <q-step
                :name="2"
                title="Create an ad group"
                caption="Optional"
                icon="payment"
                :done="step > 2"
            >
            <div v-if="billPaymentView == false">
                <div class="text-h6">PAYMENT</div>
                <div class="text-overline text-capitalize">({{MDetails.memberName}}) - <span class="text-uppercase text-teal">{{MDetails.memberDesignation}}</span>  </div>
                <q-input v-model="membershipFee" readonly="" type="number" prefix="₱" label="Membership Fee" outlined="" color="teal" v-if="MDetails.isNewMember == true"/>
                <div class="q-gutter-md" v-else>
                    <q-input v-model="mf1" type="number" prefix="₱" label="Management Fee" outlined="" color="teal" clearable @clear="mf1 = 0" readonly=""/>
                    <q-input v-model="ss1" type="number" prefix="₱" label="Share of Stocks" outlined="" color="teal" clearable @clear="ss1 = 0" readonly=""/>
                    <q-input v-model="sd1" type="number" prefix="₱" label="Savings Deposit" outlined="" color="teal" clearable @clear="sd1 = 0"/>
                    <div class="text-overline"><q-checkbox v-model="showOther1" dense="" class="q-mr-sm"/> OTHERS</div>
                    
                    <div v-show="showOther1">
                        <div class="text-caption q-pl-md">Select from the items below.</div>
                        <q-option-group
                            v-model="otherSelect"
                            :options="returnMapOthers"
                            color="teal"
                            type="checkbox"
                            class="q-my-none"
                        />
                        <div class="text-caption q-mt-md q-pl-md" v-show="otherSelect.length > 0">Add quantity to the selected items.</div>
                        <div v-for="other in otherSelect" :key="other['.key']" class="row justify-between">
                            <div class="q-pa-md">{{other}}</div>
                            <q-input v-model="toPayOthersQty[other]" min="1" class="col-4" dense type="number" label="QTY" outlined="" color="teal" clearable @clear="toPayOthersQty[other.value] = 0"/>     
                        </div>
                    </div>


                    <div v-show="hasCA">
                    <div class="text-overline">CASH ADVANCES</div> 
                    <q-banner class="bg-info text-white q-mt-none" v-show="hasCA">
                        <!-- <q-icon name="info" /> You have ₱ {{ returnSelectedMember != {} ? returnSelectedMember.Advances : 0 }}.00 cash advance to pay. -->
                        <q-icon name="info" /> You have {{ MDetails.advances | currency }} cash advance to pay.
                    </q-banner>   

                    <div class="text-caption q-pl-md q-pb-sm">Select advances payment option:</div>
                    <q-option-group
                        v-model="AdvanceOption"
                        :options="[{label:'All Daily Charges',value:'daily'},{label:'Specific Loan Payment',value:'specific'}]"
                        color="teal"
                        type="radio"
                        inline=""
                        class="q-my-none"
                    /> 

                    <q-input readonly="" v-model="ca" type="number" prefix="₱" label="Daily Charges Total Amount" outlined="" color="teal" :max="returnSelectedMember !== {} ? MDetails.advances : 0" clearable @clear="ca = 0" v-if="AdvanceOption == 'daily'"/>

                    <div v-show="AdvanceOption == 'specific'">

                        <div class="text-caption q-pl-md q-pb-sm">Select from the advances to pay below.</div>
                        <q-option-group
                            v-model="AdvanceSelect"
                            :options="returnMapActiveLoans"
                            color="teal"
                            type="checkbox"
                            class="q-my-none"
                            @input="getMinValue"
                        />    
                        <div class="text-caption q-pl-md q-py-md">Enter amount to pay in each item.</div> 
                        <div v-for="adv in AdvanceSelect" :key="adv['.key']" class="row justify-between">
                            <div class="q-px-md">#{{adv.CashReleaseTrackingID.toUpperCase()}}
                                <br> <span class="text-caption">Balance: ₱ {{adv.toPayAmount - adv.paidAmount}}</span> 
                            </div>
                            <q-input v-model="toPayAdvancesAmount[adv.CashReleaseTrackingID]" :min="adv.DailyCharge" :max="(adv.toPayAmount - adv.paidAmount)" class="col-6" dense type="number" label="Amount To Pay" prefix="₱" outlined="" color="teal" clearable="" @clear="toPayAdvancesAmount[adv.CashReleaseTrackingID] = 0"/>     
                        </div> 
                    </div>
                    </div>            
                </div>
                <q-separator inset spaced v-show="ifDriver == true && MDetails.isNewMember == false"/>
                <div class="q-my-md" v-show="ifDriver == true && MDetails.isNewMember == false">
                <div class="text-overline"><q-checkbox v-model="operator" dense="" class="q-mr-md" :size="operator == true ? 'lg' : 'md'"/> 
                <span v-if="operator == true" class="text-capitalize"><span class="text-h6">PAYMENT<br></span>({{driverOperator.FirstName+' '+driverOperator.LastName}}) - <span class="text-uppercase text-teal">OPERATOR</span></span> 
                <span v-else>Do you want to include the OPERATOR's payment in this transaction?</span>
                
                </div>
                <div v-show="operator" class="q-gutter-md q-mt-md">
                    <q-input v-model="mf2" type="number" prefix="₱" label="Management Fee" outlined="" color="teal" clearable @clear="mf2 = 0" readonly=""/>
                    <q-input v-model="ss2" type="number" prefix="₱" label="Share of Stocks" outlined="" color="teal" clearable @clear="ss2 = 0" readonly=""/>
                    <q-input v-model="sd2" type="number" prefix="₱" label="Savings Deposit" outlined="" color="teal" clearable @clear="sd2 = 0"/>
                    <div class="text-overline"><q-checkbox v-model="showOther2" dense="" class="q-mr-sm"/> OTHERS</div>
                    <div v-show="showOther2">
                        <div class="text-caption q-pl-md">Select from the items below.</div>
                        <q-option-group
                            v-model="otherSelect2"
                            :options="returnMapOthers"
                            color="teal"
                            type="checkbox"
                            class="q-my-none"
                        />
                        <div class="text-caption q-mt-md q-pl-md" v-show="otherSelect2.length > 0">Add quantity to the selected items.</div>
                        <div v-for="other in otherSelect2" :key="other['.key']" class="row justify-between">
                            <div class="q-pa-md">{{other}}</div>
                            <q-input v-model="toPayOthersQty2[other]" min="1" class="col-4" dense type="number" label="QTY" outlined="" color="teal" clearable @clear="toPayOthersQty2[other.value] = 0"/>     
                        </div>
                    </div>
                                                
                </div>
                </div>
            </div>
            <div v-else>
                <div class="text-h6 q-mb-md">Billing Details (#{{returnModel2Data.trackingNumber.toUpperCase()}})</div>
                <q-card class="my-card bg-grey-2 rounded-borders" flat>
                    <q-card-section>
                        <q-list v-if="returnModel2Data.billType == 'loans'">
                            <q-item>
                                <q-item-section class="text-weight-bold">Billing Name</q-item-section>
                                <q-item-section side>{{returnModel2Data.BillingName}}</q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section class="text-weight-bold">Billing Date</q-item-section>
                                <q-item-section side>{{returnModel2Data.BillingDate}}</q-item-section>
                            </q-item>
                            <q-separator />
                            <q-item>
                                <q-item-section class="text-weight-bold">Advances</q-item-section>
                                <q-item-section side>₱ {{returnModel2Data.Advances}}</q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section class="text-weight-bold">Interest Amount</q-item-section>
                                <q-item-section side>+ ₱ {{returnModel2Data.InterestAmount}} ({{returnModel2Data.InterestRate}} Interest Rate) </q-item-section>
                            </q-item>

                            <q-separator />
                            <q-item>
                                <q-item-section class="text-weight-bold">Billing Balance</q-item-section>
                                <q-item-section side>₱ {{returnModel2Data.BillingBalance}}</q-item-section>
                            </q-item>
                            <div v-show="returnModel2Data.paymentStatus == 'Partial Payment'">
                            <q-separator />
                            <q-item>
                                <q-item-section class="text-weight-bold">Partial Payment</q-item-section>
                                <q-item-section side>- ₱ {{returnModel2Data.billPaidAmount}}</q-item-section>
                            </q-item>
                            <q-separator />
                            <q-item>
                                <q-item-section class="text-weight-bold">Remaining Balance</q-item-section>
                                <q-item-section side>₱ {{parseFloat(returnModel2Data.BillingBalance) - parseFloat(returnModel2Data.billPaidAmount)}}</q-item-section>
                            </q-item>
                            </div>
                        </q-list>
                        <q-list v-else>
                            <q-item>
                                <q-item-section class="text-weight-bold">Billing Name</q-item-section>
                                <q-item-section side>{{returnModel2Data.BillingName}}</q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section class="text-weight-bold">Billing Month</q-item-section>
                                <q-item-section side>{{returnModel2Data.BillingMonth}}</q-item-section>
                            </q-item>
                            <q-separator />
                            <q-item>
                                <q-item-section class="text-weight-bold">Plate Number</q-item-section>
                                <q-item-section side>{{returnModel2Data.PlateNumber}}</q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section class="text-weight-bold">Days Unpaid x Daily (MF)</q-item-section>
                                <q-item-section side>{{returnModel2Data.NoPayDays}} x ₱ {{returnModel2Data.AmountPerDay}}.00</q-item-section>
                            </q-item>

                            <q-separator />
                            <q-item>
                                <q-item-section class="text-weight-bold">Quota Balance</q-item-section>
                                <q-item-section side>₱ {{returnModel2Data.QuotaBalance}}.00</q-item-section>
                            </q-item>
                            <div v-show="returnModel2Data.paymentStatus == 'Partial Payment'">
                            <q-separator />
                            <q-item>
                                <q-item-section class="text-weight-bold">Partial Payment</q-item-section>
                                <q-item-section side>₱ {{returnModel2Data.billPaidAmount}}</q-item-section>
                            </q-item>
                            <q-separator />
                            <q-item>
                                <q-item-section class="text-weight-bold">Remaining Balance</q-item-section>
                                <q-item-section side>₱ {{parseFloat(returnModel2Data.QuotaBalance) - parseFloat(returnModel2Data.billPaidAmount)}}</q-item-section>
                            </q-item>
                            </div>
                        </q-list>
                    </q-card-section>
                </q-card>
            </div>
            <q-stepper-navigation class="row justify-between">

                <q-btn flat @click="step = 1,clearForm()" color="grey-10" label="Back" class="q-ml-sm" />
                <q-btn @click="$refs.stepper.next()" color="teal" icon-right="arrow_right" :label="step === 2 ? 'Proceed to Payment' : 'Continue'" :disable="MDetails.memberID == ''"/>
            </q-stepper-navigation>

            </q-step>
            <q-step
                :name="3"
                title="Select campaign settings"
                icon="list"
                :done="step > 3"
            >
                <div v-if="billPaymentView == false">
                    <div v-show="MDetails.isNewMember == false">
                        <div class="text-h6 q-mb-md" v-if="jeepneyDetails == null">Select Unit/Jeep below:</div>
                        <div class="text-h6 q-mb-md" v-else>Selected Unit/Jeep: <q-chip color="teal" class="q-pa-md" text-color="white" icon="directions_bus" :label="jeepneyDetails" :removable="!defaultUnitDisabled" @remove="jeepneyDetails = null"/> <q-btn v-show="defaultUnitDisabled" color="grey-8"  dense flat icon="close" label="remove default" size="sm" @click="removeDefaultUnit" /></div>
                    <div v-if="mapUnitsOfMember.length > 0">
                        <q-select 
                            v-model="jeepneyDetails" 
                            :options="membersUnitsOpt" 
                            label="Search Unit/Jeepney Plate Number" 
                            filled 
                            input-debounce="0"
                            use-input
                            color="grey-10"
                            use-chips
                            :clearable="!defaultUnitDisabled"
                            emit-value=""
                            map-options=""
                            @new-value="createValue3"
                            @filter="filterFn3"
                            @clear="jeepneyDetails = null"
                            :disable="defaultUnitDisabled"
                            v-show="MDetails.defaultUnit == null"
                        >
                            <template v-slot:selected-item="scope">
                                <q-chip
                                    dense
                                    :tabindex="scope.tabindex"
                                    color="white"
                                    text-color="secondary"
                                    class="q-ma-none"
                                    :disable="defaultUnitDisabled"
                                >
                                    {{ scope.opt.label }}
                                </q-chip>
                            </template>
                        </q-select>    
                        <div v-show="MDetails.memberDesignation !== 'Operator' && MDetails.defaultUnit == null"><q-checkbox v-model="defaultUnit" :disable="defaultUnitDisabled" @input="defaultUnitCheck"/> Do you want <b>{{jeepneyDetails}}</b> to be your default Unit/Jeep recorded in your payments?</div>   
                    </div>
                    <div v-else>
                        <q-banner class="bg-warning text-white">
                            <q-icon name="warning" /> You have no jeep/units registered yet. Go to Jeep/Unit Registration first.
                        </q-banner>      
                    </div>   
                    </div>      
                    <div class="text-h6 q-mb-md" >Transaction Details</div>  
                    <q-input v-model="amountPaid" input-class="text-h6 text-right" clearable :rules="[val => val >= returnTotalAmount || 'Please enter amount greater than or equal to the total amount to pay.']" bottom-slots="" type="number" prefix="₱" label="Amount Paid" outlined="" color="teal" ref="amountPaid" autofocus="" @focus="$event.target.select()"/>      
                    <q-list class="q-mt-lg bg-grey-2">
                        <q-item>
                            <q-item-section>
                                <q-item-label>TOTAL DUE AMOUNT</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-item-label class="text-h6 text-left">₱ {{returnTotalAmount}}.00</q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-separator spaced />
                        <q-item>
                            <q-item-section>
                                <q-item-label>CHANGE</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-item-label class="text-h6 text-left" v-if="returnChange !== 'INSUFFICIENT AMOUNT !'">₱ {{returnChange}}.00</q-item-label>
                                <q-item-label class="text-h6 text-left text-red" v-else>{{returnChange}}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>  
                       
                </div>
                <div v-else>
                <div class="text-h6">Transaction Details</div>  
                    <q-input v-model="amountPaidBills" input-class="text-h6 text-right" clearable type="number" prefix="₱" label="Amount Paid" outlined="" color="teal" ref="amountPaid" autofocus="" @focus="$event.target.select()"/>      
                    <q-list>
                        <q-item>
                            <q-item-section>
                                <q-item-label>TOTAL DUE AMOUNT</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-item-label class="text-h6 text-left">₱ {{returnBillTotal}}.00</q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-separator spaced />
                        <q-item v-if="returnBillTotal >= amountPaidBills">
                            <q-item-section>
                                <q-item-label>REMAINING BALANCE</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-item-label class="text-h6 text-left">₱ {{returnBillTotal - amountPaidBills}}</q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item v-else>
                            <q-item-section>
                                <q-item-label>CHANGE</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-item-label class="text-h6 text-left" v-if="returnChangeBill !== 'INSUFFICIENT AMOUNT !'">₱ {{returnChangeBill}}</q-item-label>
                                <q-item-label class="text-h6 text-left text-red" v-else>{{returnChangeBill}}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>    
                </div>
                <q-stepper-navigation class="row justify-between">
                    <q-btn flat @click="step = 2" color="grey-10" label="Back" class="q-ml-sm" />
                    <q-btn @click="PayFee" color="teal" label="Confirm Payment" :disable="returnDisabledPayment" v-if="billPaymentView == false" icon-right="arrow_right"/>
                    <q-btn @click="PayFeeBills" color="teal" label="Confirm Payment" v-else icon-right="arrow_right"/>

                </q-stepper-navigation>
            </q-step>
            <q-step
                :name="4"
                title="Select campaign settings"
                icon="check"
                :done="step > 4"
            >
                <div class="text-center text-teal text-h4 q-mt-xl">Transaction Successful</div>
                <div class="text-center text-h6">Would you like to make another Transaction?</div> 


                <q-stepper-navigation class="text-center">
                    <q-btn color="grey-10" label="Yes" @click="step = 1,clearForm()" />
                    <q-btn flat  color="grey-10" label="see payment list" class="q-ml-sm" :to="'/admin/allpayment'"/>
                </q-stepper-navigation>            
            </q-step>

        </q-stepper>        
    </q-page>
</template>
<script>
import { firebaseDb, firebaseSto, firefirestore, Auth2 } from 'boot/firebase';

import Vue from "vue";
import money from 'v-money'
import { mapGetters } from 'vuex'
import VueQrcodeReader from "vue-qrcode-reader";
import { date } from 'quasar'
import axios from 'axios'

Vue.use(money, {precision: 4})


Vue.use(VueQrcodeReader);
export default {
    data(){
        return {
            amountPaidBills: 0,
            trackingNumber: '',
            text: '',
            step: 1,
            defaultUnit: false,
            defaultUnitDisabled: false,
            operator: false,
            ifDriver: false,
            model: null,
            model2: null,
            membersIdOpt: Object.freeze(this.membersIdOptions),
            membersIdOptTracking: Object.freeze(this.membersIdOptionsTracking),
            membersUnitsOpt: Object.freeze(this.mapUnitsOfMember),
            MemberData: [],
            jeepneyDetails: null,
            PayTrackers: [],
            MDetails:{
                memberID: '',
                memberName: '',
                memberDesignation: '',
                isNewMember: false,
                operator: ''
            },
            membershipFee: 500,
            mf1: 0,
            ss1: 0,
            sd1: 0,
            other1: 0,
            otherDescription1: '',
            ca: 0,
            mf2: 0,
            ss2: 0,
            sd2: 0,
            otherDescription2: '',
            other2: 0,
            showOther1: false,
            showOther2: false,
            showCA: false,
            hasCA: false,
            driverOperator: {},
            amountPaid: 0,
            lastTransaction: {},
            TransactionID: '',
            OrNo: '',
            scanner: false,
            OtherPayments: [],
            FixedPayments: [],
            otherSelect: [],
            toPayOthersQty: [],
            otherSelect2: [],
            toPayOthersQty2: [],
            ManagementFeeDriver: 0,
            ManagementFeeOperator: 0,
            MembershipFee: 0,
            ShareOfStocks: 0,
            AdvanceSelect: [],
            toPayAdvancesAmount: [],
            AdvanceOption: 'daily',
            billPaymentView: false,
        }
    },
    firestore(){
        return {
            Transactions: firebaseDb.collection('Transactions'),
            MemberData: firebaseDb.collection('MemberData'),
            PayTrackers: firebaseDb.collection('PayTrackers'),
            BillingTrackers: firebaseDb.collection('BillingTrackers'),
            OtherPayments: firebaseDb.collection('OtherPayments'),
            FixedPayments: firebaseDb.collection('FixedPayments'),
            JeepneyData: firebaseDb.collection('JeepneyData'),
            
            ManagementFeeDriver: firebaseDb.collection('FixedPayments').doc('ManagementFeeDriver'),
            ManagementFeeOperator: firebaseDb.collection('FixedPayments').doc('ManagementFeeOperator'),
            MembershipFee: firebaseDb.collection('FixedPayments').doc('MembershipFee'),
            ShareOfStocks: firebaseDb.collection('FixedPayments').doc('ShareOfStocks')
        }
    },
    async mounted() {
        // this.TransactionID = await this.genTransactionID
      this.$binding('lastTransaction', firebaseDb.collection('Transactions').orderBy('timestamp', 'desc').limit(1))
        .then(data => {
          if (data.length != 0) {
            // has data
            this.TransactionID = ++data[0].TransactionID
            this.OrNo = ++data[0].OrNo
          } else {
            // empty Transactions
            var transacIdFormat = 100000
            var ORFormat = 1000000
            this.TransactionID = transacIdFormat
            this.OrNo = ORFormat
          }
        })
    },
    computed: {
        ...mapGetters('subModules', ['genTransactionID', 'genORNo', 'currencyToNumber']),
        getIncludeOperatorPaymentTotal () {
            return this.currencyToNumber(this.mf2) +this.currencyToNumber(this.ss2) +this.currencyToNumber(this.sd2) +this.currencyToNumber(this.other2) + this.currencyToNumber(this.returnOtherSum2)            
                // this.currencyToNumber(this.includeFee.Advances)
        },
        returnModel2Data(){
            try {
                if(this.model2 !== null){
                    console.log(this.model2,'returnModel2Data')
                    let bill = this.model2

                    if(bill.billType == 'loans'){
                        const loanID = bill.CashReleaseTrackingID
                        const memberID = bill.MemberID
                        const billDate = bill.timestamp.toDate()
                        let transactions = this.Transactions.filter(a=>{
                            return a.MemberID == memberID && a.AdvancesAmount !== 0 && a.AdvancesAmount !== undefined && a.timestamp.toDate() > billDate
                        })

                        let getAmount = []
                        transactions.forEach(a=>{
                            a.Advances.forEach(b=>{
                                if(b.trackID == loanID){
                                    getAmount.push(b)
                                }
                            })
                        })
                    
                        let getAmountSum = this.$lodash.sumBy(getAmount,a=>{
                            return parseFloat(a.paidAmount)
                        })
                        console.log(transactions,'trans')
                        console.log(getAmount,'getAmount')
                        console.log(getAmountSum,'sum')

                        if(getAmount.length > 0){
                            bill.paymentStatus = 'Partial Payment'
                            bill.billPaidAmount =  getAmountSum
                        }

                        console.log(bill,'bill')
                    }

                    return bill
                } else {
                    return {
                        trackingNumber: '',
                        billType: 'loans',
                        BillingName: '',
                        BillingDate: '',
                        Advances: 0,
                        InterestAmount: 0,
                        InterestRate: 0,
                        BillingBalance: 0,
                        QuotaBalance: 0,
                        BillingMonth: '',
                        PlateNumber: '',
                        NoPayDays: 0,
                        AmountPerDay: 0,
                        paymentStatus: '',
                        billPaidAmount: ''
                    }
                }
            } catch (error) {
                console.log(error,'returnModel2Data')
                return {

                }
            }
        },
      membersIdOptions () {
        let opt = this.MemberData.map(d => {
            let full = d.FirstName + ' ' + d.LastName
            let opID = ''
            if(d.Designation == 'Operator'){ opID = d['.key'] }
            else { 
                let op = {...d.Operator}
                opID = op.MemberID 
            }
          return {
            label: d['.key'] +' - '+full.toUpperCase() + ' ('+d.Designation+')',
            value: d['.key'] +' - '+full.toUpperCase() + ' ('+d.Designation+')',
            fullName: full,
            id: d['.key'],
            designation: d.Designation,
            OperatorID: opID
          }
        })
        console.log(opt,'opt')
        return opt
        // Object.freeze(options)
      },
      membersIdOptionsTracking () {
        let opt = this.PayTrackers.map(d => {
            let object = this.returnTrackingNumbersInfo(d.MemberID)
            let text = object.label

            object.label = d['.key'].slice(0,10).toUpperCase() +' - '+text
            object.value = d['.key'].slice(0,10).toUpperCase() +' - '+text
            object.trackingNumber = d['.key'].slice(0,10).toUpperCase()
            // console.log(object.label,'label check')
            return object
        })
        // console.log('membersIdOptionsTracking',opt)
        //check if paid already



        let opt2 = this.BillingTrackers.map(a=>{
            let id_member = a.MemberData['.key']

            let object2 = this.returnTrackingNumbersInfo(id_member)

            let text2 = object2.label

            object2.label = a['.key'].slice(0,10).toUpperCase() +' - '+text2
            object2.value = a['.key'].slice(0,10).toUpperCase() +' - '+text2
            object2.trackingNumber = a['.key'].slice(0,10).toUpperCase()
            object2.billType = a.QuotaBalance !== undefined ? 'quota' : 'loans'
            // console.log(object.label,'label check')
            return {...object2,...a}          
        })

        console.log(opt2,'billing trackers')
        this.getLatestBillsOnly(opt2)
        console.log('getLatestBillsOnly')
        // remove paid membership fee
        // check if still new member

        let unpaid = []

        opt.forEach(a=>{
            let index = this.$lodash.findIndex(this.Transactions, obj=>{return obj.TrackingNumber == a.trackingNumber})
            if(index == -1 && this.returnIsNewMember(a.id) == true){
                unpaid.push(a)
            }
        })
        console.log(unpaid,'unpaid')
        return [].concat(unpaid,this.getLatestBillsOnly(opt2))
        // Object.freeze(options)
      },
      mapUnitsOfMember(){
          try {
            let id = this.model !== null ? this.model : this.model2
            let filter = this.JeepneyData.filter(a=>{
                return a.MemberID == id.OperatorID && a.Status == 'approved'
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
          } catch (error) {
            console.log()
            return []
          }
      },
      mergeQtyOther(){
          try {
            let map = []
            this.otherSelect.forEach(a=>{
                let obj = {
                    description: a,
                }
                obj.qty = parseInt(this.toPayOthersQty[a])
                obj.amount = parseInt(this.getAmountOthers(a))
                obj.totalPrice = obj.qty * obj.amount


                if(this.toPayOthersQty[a] !== undefined){
                    map.push(obj)
                }
            }) 
            return map              
          } catch (error) {
              return []
          }
      },


      returnOtherSum(){
          try {

            let sum = this.$lodash.sumBy(this.mergeQtyOther,'totalPrice')
            // console.log(sum,'sumtotal')
            return isNaN(sum) ? 0 : sum
          } catch (error) {
              return 0
          }
      },
      mergeQtyOther2(){
          try {
            let map = []
            this.otherSelect2.forEach(a=>{
                let obj = {
                    description: a,
                }
                obj.qty = parseInt(this.toPayOthersQty2[a])
                obj.amount = parseInt(this.getAmountOthers(a))
                obj.totalPrice = obj.qty * obj.amount


                if(this.toPayOthersQty2[a] !== undefined){
                    map.push(obj)
                }
            }) 

            console.log(map,'map2')
            return map              
          } catch (error) {
              return []
          }
      },
      returnOtherSum2(){
          try {

            let sum = this.$lodash.sumBy(this.mergeQtyOther2,'totalPrice')
            // console.log(sum,'sumtotal2')
            return isNaN(sum) ? 0 : sum
          } catch (error) {
              return 0
          }
      },

      mergeAdvances(){
          try {
            let map = []
            this.AdvanceSelect.forEach(a=>{
                a.MemberPayAmount = parseInt(this.toPayAdvancesAmount[a.CashReleaseTrackingID])
                if(this.toPayAdvancesAmount[a.CashReleaseTrackingID] !== undefined){
                    map.push(a)
                }
            }) 
            console.log(map,'mergeAdvances')
            return map              
          } catch (error) {
              return []
          }
      },

      saveAdvancesData(){
          try {
              if(this.AdvanceOption == 'daily') return this.$lodash.map(this.returnSelectedMember.activeLoans,a=>{
                  return {
                      paidAmount: a.DailyCharge,
                      trackID: a.CashReleaseTrackingID,
                      requestID: a.requestID
                  }
                })

              if(this.AdvanceOption == 'specific') return this.$lodash.map(this.mergeAdvances,a=>{
                  return {
                      paidAmount: a.MemberPayAmount,
                      trackID: a.CashReleaseTrackingID,
                      requestID: a.requestID                      
                  }
              })

          } catch (error) {
              return []
          }
      },

      returnAdvanceSum(){
          try {

            let sum = this.$lodash.sumBy(this.mergeAdvances,'MemberPayAmount')
            // console.log(sum,'sumtotal')
            return isNaN(sum) ? 0 : sum
          } catch (error) {
              return 0
          }
      },
      returnTotalAmount(){
          if(this.MDetails.isNewMember == false){
              let x = this

                let loans = 0
              if(x.hasCA == true){
                  if(x.AdvanceOption == 'daily'){
                      loans = x.ca
                  } else {
                      loans = x.returnAdvanceSum
                  }
              }


              let pay1 = parseInt(x.mf1) + parseInt(x.ss1) + parseInt(x.sd1) + parseInt(x.other1) + loans + this.returnOtherSum
              let pay2 = parseInt(x.mf2) + parseInt(x.ss2) + parseInt(x.sd2) + parseInt(x.other2) + this.returnOtherSum2
              if(this.operator == true){
                  return pay1 + pay2
              } else {
                  return pay1
              }
          } else {
              return this.MembershipFee.amount
          }
      },
      returnBillTotal(){
          if(this.returnModel2Data.billType == 'quota'){
              if(this.returnModel2Data.paymentStatus == 'Partial Payment'){
                  return this.returnModel2Data.QuotaBalance - this.returnModel2Data.billPaidAmount
              }
              return this.model2.QuotaBalance
          } else {
            if(this.returnModel2Data.paymentStatus == 'Partial Payment'){
                  return this.returnModel2Data.BillingBalance - this.returnModel2Data.billPaidAmount
              }
              return this.returnModel2Data.BillingBalance
          }
      },
      returnChange(){
          if(this.amountPaid >= this.returnTotalAmount){
              return this.amountPaid - this.returnTotalAmount
          } else {
              return 'INSUFFICIENT AMOUNT !'
          }
      },
      returnChangeBill(){
          if(this.amountPaidBills >= this.returnBillTotal){
              return this.amountPaidBills - this.returnBillTotal
          } else {
              return 'INSUFFICIENT AMOUNT !'
          }
      },
      returnSelectedMember(){
          try {
            if(this.model == null){
                return this.MemberData.filter(d => {
                    return d['.key'] === this.model2.id
                })[0]
            } else {
                return this.MemberData.filter(d => {
                    return d['.key'] === this.model.id
                })[0]
            }
          } catch (error) {
            return {
                Advances: 0
            }
          }
      },
      returnMapActiveLoans(){
        try {
            let loans = this.returnSelectedMember.activeLoans
            let map = loans.map(a=>{
                a.label = `#${a.CashReleaseTrackingID.toUpperCase()} - ₱${a.DailyCharge}.00 / Day`
                return {
                    label: a.label,
                    value: a
                }
            })
            console.log('returnMapActiveLoans',map)
            return map
        } catch (error) {
            return []
        }
      },
      returnMapOthers(){
          try {
            return this.OtherPayments.map(a=>{
                return {
                    label: a.description + ' (₱ ' + a.amount + '.00) ',
                    value: a.description,
                    amount: a.amount
                }
            })
          } catch (error) {
              return []
          }
      },
      returnDisabledPayment(){
          if(this.returnChange == 'INSUFFICIENT AMOUNT !') return true
          if(this.MDetails.isNewMember == false && this.jeepneyDetails == null) return true
          return false
      }
    },
    methods: {
        getLatestBillsOnly(array){
            let group = this.$lodash.groupBy(array,a=>{
                return a.billType == 'quota' ? a.PlateNumber : a.CashReleaseTrackingID
            })

            let map = this.$lodash.map(group,function(value,key){
                return {
                    Marker: key,
                    Array: value
                }
            })
            console.log(group,'getLatestBillsOnly')
            console.log(map,'map')

            let latest = []

            map.forEach(a=>{
                let order = this.$lodash.orderBy(a.Array,n=>{
                    return n.timestamp.toDate()
                },'desc')[0]
                if(order.paymentStatus !== 'Full Payment'){
                    latest.push(order)
                }
                
            })

            console.log(latest,'latest bills')
            return latest
        },
        returnIsNewMember(id){
            return this.MemberData.filter(a=>{
                return a['.key'] == id
            })[0].isNewMember
        },
        getUnitDetails(PlateNumber){
            return this.JeepneyData.filter(a=>{
                return a.PlateNumber == PlateNumber
            })[0]
        },
        returnTrackingNumbersInfo(id){
            let filter = this.MemberData.filter(a=>{
                return a['.key'] == id
            })

            let opt = filter.map(d => {
                let full = d.FirstName + ' ' + d.LastName
                let opID = ''
                if(d.Designation == 'Operator'){ opID = d['.key'] }
                else { 
                    let op = {...d.Operator}
                    opID = op.MemberID 
                }
            return {
                label: d['.key'] +' - '+full.toUpperCase() + ' ('+d.Designation+')',
                value: d['.key'] +' - '+full.toUpperCase() + ' ('+d.Designation+')',
                fullName: full,
                id: d['.key'],
                designation: d.Designation,
                OperatorID: opID
            }

            })

            return opt[0]
        },
        onDecode (decodedString) {
            console.log(decodedString,'on decode')
            this.changeMemberDetails({id: decodedString})
            this.scanner = false
        },
        clearForm(){
            console.log('back click')
            this.operator= false
            this.ifDriver= false
            this.model= null
            this.removeMemberDetails()
            this.membershipFee= 500
            this.mf1= 0
            this.ss1= 0
            this.sd1= 0
            this.other1= 0
            this.ca = 0
            this.showOther1 = false
            this.showOther2 = false
            this.showCA = false
            this.hasCA = false
            this.otherDescription1= ''
            this.mf2= 0
            this.ss2= 0
            this.sd2= 0
            this.otherDescription2= ''
            this.other2= 0
            this.driverOperator= {}
            this.amountPaid= 0
            this.otherSelect = []
            this.otherSelect2 = []
            this.toPayOthersQty = []
            this.toPayOthersQty2 = []
            this.trackingNumber = ''
            this.model2=null
            this.AdvanceSelect= []
            this.AdvanceOption='daily'
            this.toPayAdvancesAmount = []
            this.jeepneyDetails = null
            this.amountPaidBills = 0
            this.billPaymentView = false
        },
        createValue (val, done) {
        // Calling done(var) when new-value-mode is not set or "add", or done(var, "add") adds "var" content to the model
        // and it resets the input textbox to empty string
        // ----
        // Calling done(var) when new-value-mode is "add-unique", or done(var, "add-unique") adds "var" content to the model
        // only if is not already set
        // and it resets the input textbox to empty string
        // ----
        // Calling done(var) when new-value-mode is "toggle", or done(var, "toggle") toggles the model with "var" content
        // (adds to model if not already in the model, removes from model if already has it)
        // and it resets the input textbox to empty string
        // ----
        // If "var" content is undefined/null, then it doesn't tampers with the model
        // and only resets the input textbox to empty string

        if (val.length > 2) {
            if (!this.membersIdOpt.includes(val)) {
            done(val, 'add-unique')
            }
        }
        },

        filterFn (val, update) {
            update(() => {
                if (val === '') {
                    this.membersIdOpt = this.membersIdOptions
                }
                else {
                    const needle = val.toLowerCase()
                    this.membersIdOpt = this.membersIdOptions.filter(
                        v => v.value.toLowerCase().indexOf(needle) > -1
                    )
                }
            })
        },
        createValue2 (val, done) {
        // Calling done(var) when new-value-mode is not set or "add", or done(var, "add") adds "var" content to the model
        // and it resets the input textbox to empty string
        // ----
        // Calling done(var) when new-value-mode is "add-unique", or done(var, "add-unique") adds "var" content to the model
        // only if is not already set
        // and it resets the input textbox to empty string
        // ----
        // Calling done(var) when new-value-mode is "toggle", or done(var, "toggle") toggles the model with "var" content
        // (adds to model if not already in the model, removes from model if already has it)
        // and it resets the input textbox to empty string
        // ----
        // If "var" content is undefined/null, then it doesn't tampers with the model
        // and only resets the input textbox to empty string

        if (val.length > 2) {
            if (!this.membersIdOptTracking.includes(val)) {
            done(val, 'add-unique')
            }
        }
        },

        filterFn2 (val, update) {
            update(() => {
                if (val === '') {
                    this.membersIdOptTracking = this.membersIdOptionsTracking
                }
                else {
                    const needle = val.toLowerCase()
                    this.membersIdOptTracking = this.membersIdOptionsTracking.filter(
                        v => v.value.toLowerCase().indexOf(needle) > -1
                    )
                }
            })
        },
        createValue3 (val, done) {
        // Calling done(var) when new-value-mode is not set or "add", or done(var, "add") adds "var" content to the model
        // and it resets the input textbox to empty string
        // ----
        // Calling done(var) when new-value-mode is "add-unique", or done(var, "add-unique") adds "var" content to the model
        // only if is not already set
        // and it resets the input textbox to empty string
        // ----
        // Calling done(var) when new-value-mode is "toggle", or done(var, "toggle") toggles the model with "var" content
        // (adds to model if not already in the model, removes from model if already has it)
        // and it resets the input textbox to empty string
        // ----
        // If "var" content is undefined/null, then it doesn't tampers with the model
        // and only resets the input textbox to empty string

        if (val.length > 2) {
            if (!this.membersUnitsOpt.includes(val)) {
            done(val, 'add-unique')
            }
        }
        },

        filterFn3 (val, update) {
            update(() => {
                if (val === '') {
                    this.membersUnitsOpt = this.mapUnitsOfMember
                }
                else {
                    const needle = val.toLowerCase()
                    this.membersUnitsOpt = this.mapUnitsOfMember.filter(
                        v => v.label.toLowerCase().indexOf(needle) > -1
                    )
                }
            })
        },
        onClick(){
            let map = []
            this.otherSelect.forEach(a=>{
                let obj = {
                    description: a,
                }
                obj.qty = parseInt(this.toPayOthersQty[a])
                obj.amount = parseInt(this.getAmountOthers(a))
                obj.totalPrice = obj.qty * obj.amount


                if(this.toPayOthersQty[a] !== undefined){
                    map.push(obj)
                }
            })
            console.log(map,'map')
        },
        getAmountOthers(desc){
            return this.returnMapOthers.filter(a=>{
                return a.value == desc
            })[0].amount
        },
        removeMemberDetails(){
            this.MDetails.memberID = ''
            this.MDetails.memberName = ''
            this.MDetails.memberDesignation = ''
            this.MDetails.isNewMember = false
            this.trackingNumber = ''
            this.model = null
            this.model2 = null
        },
        changeMemberDetails(val){
            
            let member = this.MemberData.filter(d => {
            return d['.key'] === val.id
            })[0]

            console.log(val.trackingNumber,'val.trackingNumber')

            if(val.trackingNumber !== undefined){
                this.trackingNumber = val.trackingNumber
                
                if(val.billType !== undefined){
                    this.billPaymentView = true
                    console.log(this.model2,'billing details')
                } else {
                    this.billPaymentView = false
                }
            }

            if(member.Advances !== 0 || member.Advances !== undefined){
                this.hasCA = true
                this.AdvanceSelect = this.returnMapActiveLoans.map(a=>{return a.value})
                let sum = this.$lodash.sumBy(member.activeLoans,a=>{return parseInt(a.DailyCharge)})
                this.ca = sum
                
            } else {
                this.hasCA = false
            }

            if(member.defaultUnit !== undefined){
                let jeep = member.defaultUnit
                this.MDetails.defaultUnit = jeep.PlateNumber
                this.jeepneyDetails = jeep.PlateNumber
                this.defaultUnitDisabled = true
                this.defaultUnit = true
                console.log(this.jeepneyDetails,'jeep default')
            } else {
                this.MDetails.defaultUnit = null
                this.defaultUnitDisabled = false
                this.defaultUnit = false
                this.jeepneyDetails = null
            }

            if(val !== null){
                this.MDetails.memberID = val.id
                this.MDetails.memberName = `${member.LastName} ${member.FirstName}`
                this.MDetails.memberDesignation = member.Designation
                this.MDetails.isNewMember = member.isNewMember
                this.MDetails.operator = member.Operator
                



                let sumAdvances = this.$lodash.sumBy(member.activeLoans,a=>{
                    let sum = 0
                    if(a.TotalBalance == undefined){
                        sum = (parseFloat(a.toPayAmount) - parseFloat(a.paidAmount))
                    } else {
                        sum = (parseFloat(a.TotalBalance) - parseFloat(a.paidAmount))
                    }
                    return sum
                })

                console.log(sumAdvances,'sumAdvances')


                this.MDetails.advances = sumAdvances
                this.MDetails.activeLoans = member.activeLoans
                this.hasCA = member.Advances > 0

                if(member.isNewMember){
                    this.membershipFee = this.MembershipFee.amount
                }
                
                if(member.Designation === 'Driver'){
                    this.mf1 = this.ManagementFeeDriver.amount
                    this.ss1 = this.ShareOfStocks.amount
                    this.mf2 = this.ManagementFeeOperator.amount
                    this.ss2 = this.ShareOfStocks.amount   
                    this.ifDriver = true
                    this.driverOperator = member.Operator
                } else {
                    this.mf1 = this.ManagementFeeOperator.amount
                    this.ss1 = this.ShareOfStocks.amount     
                    this.ifDriver = false   
                    this.driverOperator = {}             
                }

            }
        },
        async savePayment(){
            let Payment = {
                MemberID: '',
                OrNo: '',
                TransactionID: '',
                MembershipFee: 500,
                ManagementFee: 15,
                ShareCapital: 30,
                SavingsDeposit: 0,
                Advances: 0,
                Others: 0,
                OthersDes: '',
                Total: 0,
                timestamp: ''
            }
            
            this.$refs.stepper.next()
        },
        async PayFeeBills () {
            let vm = this
            const bill = vm.model2
            let billID = bill['.key']
            let billType = bill.billType
            let MemberID = this.MDetails.memberID


            var payment = {
                MemberID: this.MDetails.memberID,
                OrNo: this.OrNo,
                TransactionID: this.TransactionID,
                TransactionType: 'Bills Payment',    
                Total: this.returnBillTotal,
                AmountPaid: parseFloat(this.amountPaidBills),  
                TrackingNumber: this.trackingNumber, 
                timestamp: firefirestore.FieldValue.serverTimestamp()         
            }
            let smsAmount = this.returnBillTotal
            let remainingBalance = 0
            if(this.returnBillTotal >= this.amountPaidBills){
                remainingBalance = this.returnBillTotal - this.amountPaidBills
                payment.remainingBalance = remainingBalance
                smsAmount = this.amountPaidBills
            }

            let status = 'Full Payment'
            if(remainingBalance > 0){
                status = 'Partial Payment'
                payment.paymentStatus = status
            } else {
                payment.paymentStatus = status
            }


            let loanID = bill.CashReleaseTrackingID
            let activeLoans = this.returnSelectedMember.activeLoans
            let update = null
            if(billType == 'loans'){
                update = activeLoans.filter(a=>{ 
                    return a.CashReleaseTrackingID == loanID
                })[0]
            }


            let totalAmountPaid = parseFloat(this.amountPaidBills)
            if(bill.paymentStatus == 'Partial Payment' || status == 'Partial Payment'){
                totalAmountPaid = totalAmountPaid + parseFloat(bill.billPaidAmount)
                if(totalAmountPaid > this.returnBillTotal){
                    totalAmountPaid = this.returnBillTotal
                }
            } else {
                totalAmountPaid = this.returnBillTotal
            }


            console.log('payment',payment)
            console.log('bill',billID, bill)

            firebaseDb.collection('Transactions').add(payment)
            .then(async (doc) => {
                this.$forceUpdate()
                console.log(doc.id,'doc id')
                console.log(payment, 'payment details')
                vm.sendSMS(doc.id,payment.MemberID,smsAmount) 

                if(billType == 'quota'){
                    //update billing with status
                    firebaseDb.collection('BillingTrackers').doc(billID).update({paymentStatus: status,billPaidAmount: totalAmountPaid})
                    .then(()=>{
                        console.log('bill updated success')
                        vm.$q.notify({
                        icon: 'info',
                        color: 'positive',
                        message: 'Bill Payment Success'
                        })
                        vm.$refs.stepper.next()
                        vm.clearForm()
                     }).catch((err)=>{
                         console.log(err,'bill update error')
                     }) 

                } else {
                    firebaseDb.collection('BillingTrackers').doc(billID).update({paymentStatus: status,billPaidAmount: totalAmountPaid})
                    .then(()=>{
                        console.log('bill updated success')
                        //update advances and active loans in member data

                        // array remove
                        let arrayRemove = {...update}

                        // array update
                        let arrayUpdate = {...update}
                        arrayUpdate.paidAmount = parseFloat(arrayUpdate.paidAmount) + parseFloat(this.amountPaidBills)
                        
                        if(status == 'Full Payment'){
                            firebaseDb.collection('MemberData').doc(MemberID).update({
                                Advances: firefirestore.FieldValue.increment(-Math.abs(update.TotalBalance)),
                                activeLoans: firefirestore.FieldValue.arrayRemove(arrayRemove),
                            }).then(()=>{
                                console.log('active Loans remove success because paid full')
                                vm.$q.notify({
                                    icon: 'info',
                                    color: 'positive',
                                    message: 'Bill Payment Success'
                                })
                                vm.$refs.stepper.next()
                                vm.clearForm()
                            })                
                        } else {
                            firebaseDb.collection('MemberData').doc(MemberID).update({
                                activeLoans: firefirestore.FieldValue.arrayRemove(arrayRemove),
                            }).then(()=>{
                                console.log('partially paid')
                                firebaseDb.collection('MemberData').doc(MemberID).update({
                                    activeLoans: firefirestore.FieldValue.arrayUnion(arrayUpdate),
                                }).then(()=>{
                                console.log('active Loans union success')
                                vm.$q.notify({
                                    icon: 'info',
                                    color: 'positive',
                                    message: 'Bill Payment Success'
                                })
                                vm.$refs.stepper.next()
                                vm.clearForm()

                                }).catch(error=>{
                                console.log(error,'active Loans union  error')
                                })   
                            }).catch(error=>{
                                console.log(error,'active Loans remove error')
                            }) 
                        }
                     }).catch((err)=>{
                         console.log(err,'bill update error')
                     }) 

                }


            }).catch(err => {
                vm.$q.notify({
                icon: 'info',
                color: 'negative',
                message: 'An error occur'
                })
                console.log(err)
            })

        },
        async PayFee () {
        // format the payment
        // save the payment to database
        // unahin muna si driver pag nag bayad
        // separate ung transactions id in every payment.
        // for driver check if ung gusto lng bayaran is ung sakanya
        // then save ung date for unpaid fee dun kay operator as well as for operator -> driver
        let vm = this

        // console.log(this.Mdetails.memberDesignation === 'Operator')
        var payment = {
            MemberID: this.MDetails.memberID,
            OrNo: this.OrNo,
            TransactionID: this.TransactionID,
            TransactionType: 'Payment',
            Designation: this.MDetails.memberDesignation,
            MembershipFee: this.MDetails.isNewMember ? Number(this.membershipFee) : 0,
            ManagementFee: this.MDetails.isNewMember ? 0 : Number(this.mf1) ,
            ShareCapital: this.MDetails.isNewMember ? 0 : Number(this.ss1),
            SavingsDeposit: this.MDetails.isNewMember ? 0 : Number(this.sd1),
            Advances: this.MDetails.isNewMember ? 0: this.saveAdvancesData,
            //Number(this.ca)
            AdvancesAmount: this.AdvanceOption == 'daily' ? Number(this.ca) : Number(this.returnAdvanceSum),
            AdvancesPaymentOption: this.AdvanceOption,
            Others: this.mergeQtyOther,
            OthersAmount: Number(this.returnOtherSum),
            Operator: this.MDetails.memberDesignation === 'Operator' ? null : this.MDetails.operator,
            isIncludeOperator: this.operator,
            paidForOperator: this.operator ? {
                ManagementFee: Number(this.mf2),
                ShareCapital: Number(this.ss2),
                SavingsDeposit: Number(this.sd2),
                // Advances: Number(this.includeFee.Advances),
                Others: this.showOther2 ? this.mergeQtyOther2 : 0,
                OtherAmount: this.showOther2 ? Number(this.returnOtherSum2) : 0,
                Total: this.getIncludeOperatorPaymentTotal,
                AmountPaid: this.getIncludeOperatorPaymentTotal,
                jeepneyDetails: this.jeepneyDetails !== null ? this.getUnitDetails(this.jeepneyDetails) : null,
            } : null,
            // paidForOperator: null,
            SharedTotal: this.operator ? this.returnTotalAmount : null,
            Total: this.returnTotalAmount - this.getIncludeOperatorPaymentTotal,
            AmountPaid: Number(this.amountPaid),
            jeepneyDetails: this.jeepneyDetails !== null ? this.getUnitDetails(this.jeepneyDetails) : null,
            timestamp: firefirestore.FieldValue.serverTimestamp()
        }

        if(this.trackingNumber !== ''){
            payment.TrackingNumber = this.trackingNumber
        }

        firebaseDb.collection('Transactions').add(payment)
          .then(async (doc) => {
            this.$forceUpdate()
            console.log(doc.id,'doc id')
            console.log(payment, 'payment details')
            vm.sendSMS(doc.id,payment.MemberID,payment.Total)  
            // after succesful payment increment fee paid to his account
            await firebaseDb.collection('MemberData').doc(payment.MemberID).update({
              ManagementFee: firefirestore.FieldValue.increment(payment.ManagementFee),
              ShareCapital: firefirestore.FieldValue.increment(payment.ShareCapital),
              SavingsDeposit: firefirestore.FieldValue.increment(payment.SavingsDeposit)
            })

            // check if has cash advance then decrement it
            if (this.hasCA) {
                let activeLoansData = this.returnSelectedMember.activeLoans
                let outMoved = []
                let upMoved = []
                activeLoansData.forEach(a=>{
                    let paidAlready = a.paidAmount
                    a.paidAmount = parseInt(a.paidAmount) + parseInt(this.getPaidAmount(a.CashReleaseTrackingID))

                    if((parseInt(a.toPayAmount) - parseInt(a.paidAmount)) == 0){
                        outMoved.push(a)
                    } else {
                        upMoved.push(a)
                    }
                })
                console.log(activeLoansData,'activeLoansData') 
                console.log(upMoved,'upMoved')  
                
                if(upMoved.length < activeLoansData.length){
                    let sum = this.$lodash.sumBy(outMoved,a=>{
                        return parseInt(a.toPayAmount)
                    })
                    await firebaseDb.collection('MemberData').doc(payment.MemberID).update({
                        activeLoans: upMoved,
                        Advances: firefirestore.FieldValue.increment(-Math.abs(sum))
                        })
                } else {
                    await firebaseDb.collection('MemberData').doc(payment.MemberID).update({activeLoans: upMoved})
                }
                // try muna
                // await firebaseDb.collection('MemberData').doc(payment.MemberID).update({activeLoans: activeLoansData})

            //   await firebaseDb.collection('MemberData').doc(payment.MemberID).update({
            //     Advances: firefirestore.FieldValue.increment(-Math.abs(payment.Advances))
            //   })
            }
            // if member is paid also for membership set isNewMember to false
            if (payment.MembershipFee > 0) {
              await firebaseDb.collection('MemberData').doc(payment.MemberID).update({
                isNewMember: false
              })
            }


            if (payment.isIncludeOperator) {
                console.log('operator payment triggered')
              // generate another payment for paying operator by the driver
              let genTransactID = await this.genTransactionID
              let genORNo = await this.genORNo
              let includeOperatorPayment = {
                OrNo: ++genORNo,
                MemberID: payment.Operator.MemberID,
                TransactionID: ++genTransactID,
                TransactionType: 'Payment',
                Designation: 'Operator',
                MembershipFee: 0,
                ManagementFee: Number(this.mf2),
                ShareCapital: Number(this.ss2),
                SavingsDeposit: Number(this.sd2),
                // Advances: Number(this.includeFee.Advances),
                Others: this.mergeQtyOther2,
                OthersAmount: Number(this.returnOtherSum2),
                Total: this.getIncludeOperatorPaymentTotal,
                SharedTotal: this.operator ? this.returnTotalAmount : null,
                isPaidByDriver: true,
                timestamp: firefirestore.FieldValue.serverTimestamp(),
                AmountPaid: this.getIncludeOperatorPaymentTotal,
                jeepneyDetails: this.jeepneyDetails !== null ? this.getUnitDetails(this.jeepneyDetails) : null,
              }
              firebaseDb.collection('Transactions').add(includeOperatorPayment)
                .then(async (doc) => {
                  await firebaseDb.collection('MemberData').doc(includeOperatorPayment.MemberID).update({
                    ManagementFee: firefirestore.FieldValue.increment(includeOperatorPayment.ManagementFee),
                    ShareCapital: firefirestore.FieldValue.increment(includeOperatorPayment.ShareCapital),
                    SavingsDeposit: firefirestore.FieldValue.increment(includeOperatorPayment.SavingsDeposit)
                  })

                console.log(doc.id,'doc id')
                console.log(includeOperatorPayment, 'operator payment details')
                vm.sendSMS(doc.id,includeOperatorPayment.MemberID,includeOperatorPayment.Total)
                //   if (this.operatorHasCashAdvance) {
                //     await firebaseDb.collection('MemberData').doc(includeOperatorPayment.MemberID).update({
                //       Advances: firefirestore.FieldValue.increment(-Math.abs(includeOperatorPayment.Advances))
                //     })
                //   }
                  vm.$q.notify({
                    icon: 'info',
                    color: 'positive',
                    message: 'Payment Success'
                  })
                  // proceed to print out receipt
                  // SEND SMS
                

                  vm.$refs.stepper.next()
                  vm.clearForm()
                }).catch(err => {
                  vm.$q.notify({
                    icon: 'info',
                    color: 'negative',
                    message: 'An error occur'
                  })
                  console.log(err,'error pay fee')
                })
            } else {
              
              vm.$q.notify({
                icon: 'info',
                color: 'positive',
                message: 'Payment Success'
              })
                // proceed to print out receipt
                // SEND SMS
                
              vm.$refs.stepper.next()
              vm.clearForm()
            }
          }).catch(err => {
            this.$q.notify({
              icon: 'info',
              color: 'negative',
              message: err.message
            })
            console.log(err,'error pay fee')
          })
      },
      sendSMS(paymentid,memberID,amount){
            let trackID = paymentid.toString().slice(0,10)
            let number = this.getMobileNumber(memberID)
            let TodayDate = date.formatDate(new Date(), 'YYYY-MM-DD hh:mm A')
            let header= {
                    'Access-Control-Allow-Origin': '*',
            }
            let message = 'SMS Reciept for the payment of P'+ amount + '.00 on '+ TodayDate +'. PaymentID# '+ trackID.toUpperCase()
            let apinumber = 2

            let data = 'number=' + number + '&' + 'message=' + message + '&' + 'apinumber=' + apinumber
            console.log(data,'data sent')

            const options = {
                method: 'POST',
                headers: { 'Access-Control-Allow-Origin': '*' },
                data: data,
                url: 'https://smsapisender.000webhostapp.com/index.php',
            }      

            axios.post('https://smsapisender.000webhostapp.com/index.php', data)
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
      getMinValue(value){
          console.log(value,'value')
          if(value.length == 0){
              this.toPayAdvancesAmount = []
          }
      },
      getPaidAmount(id){
          return this.saveAdvancesData.filter(a=>{
              return a.trackID == id
          })[0].paidAmount
      },
      removeDefaultUnit(){
        this.$q.dialog({
        title: `Remove Default Unit`,
        message: 'Would you like to remove the default unit saved ?',
        persistent: true,
        cancel: true
        }).onOk(() => {
            firebaseDb.collection('MemberData').doc(this.MDetails.memberID).update({
                defaultUnit: firefirestore.FieldValue.delete() 
            }).then(()=>{
                console.log('success delete')
                this.changeMemberDetails({id: this.MDetails.memberID})
                console.log('update views')
            })            
        })  
      },
      defaultUnitCheck(val){
          console.log(val,'defaultUnitCheck')
          console.log(this.jeepneyDetails,'jeep')
          if(this.jeepneyDetails == null){
            this.$q.dialog({
            title: `No Unit Selected!`,
            message: 'Please select unit to save as your default unit.',
            persistent: true
            }).onOk(() => {
                this.defaultUnit = false
            })              
          } else {
            if(val == true){
                this.$q.dialog({
                title: `Confirm Default Unit - ${this.jeepneyDetails}`,
                message: `Would you like to make this unit ${this.jeepneyDetails} your default unit to use in daily payments ?`,
                cancel: true,
                persistent: true
                }).onOk(() => {
                    firebaseDb.collection('MemberData').doc(this.MDetails.memberID).update({
                        defaultUnit: this.getUnitDetails(this.jeepneyDetails)
                    }).then(()=>{
                        this.$q.notify({
                            icon: 'info',
                            color: 'positive',
                            message: 'Update Default Unit Success'
                        })  
                        this.changeMemberDetails({id: this.MDetails.memberID})                      
                    })
                    //save to database as default unit
                    this.defaultUnitDisabled = true
                }).onCancel(()=>{
                    this.defaultUnit = false
                })        
            }
          }


      }

    }
}
</script>
<template>
    <q-page class="q-pa-md">
        <div class="text-h6 q-mb-md">Monitor Member Payments</div> 
        <div class="row q-gutter-md">
            <q-input outlined="" v-model="search" placeholder="Search" class="col">
            <template v-slot:append>
                <q-icon v-if="search === ''" name="search" />
                <q-icon v-else name="clear" class="cursor-pointer" @click="search = ''" />
            </template>
            </q-input> 
            <q-btn color="grey-10" icon="filter" label="filter" />
        </div>
        <div>
        </div>
        <div class="q-mt-md">
            <q-list separator>
                <q-expansion-item
                    group="somegroup"
                    icon="explore"
                    :label="`${member.FirstName} ${member.LastName} - ${member['.key']}`"
                    :label-lines="2"
                    header-class="text-grey-10"
                    v-for="member in returnMemberWithLatestPayment" :key="member['.key']" 
                >
                <q-item>
                    <q-item-section>
                    <q-item-label><b>{{member.LatestTransactionType}}</b> - OR#.{{member.LatestTransactionOrNo}}</q-item-label>
                    <q-item-label caption>
                        <span v-show="member.LatestMF" class="q-mr-sm">MF: ₱{{member.LatestMF}}</span>
                        <span v-show="member.LatestMF" class="q-mr-sm">SC: ₱{{member.LatestSC}}</span>
                        <span v-show="member.LatestSavings" class="q-mr-sm">Savings: ₱{{member.LatestSavings}}</span>
                    </q-item-label>
                    </q-item-section>
<!-- 
                    <q-item-section side top>
                    <q-badge label="10k" />
                    </q-item-section> -->
                </q-item>   
                </q-expansion-item>             
            </q-list>
        </div>
    </q-page>
</template>
<script>
import { firebaseDb, firebaseSto, firefirestore, Auth2 } from 'boot/firebase';
import { date } from 'quasar'
export default {
    data(){
        return {
            today: date.formatDate(new Date(),'MM-DD-YYYY'),
            search: ''

        }
    },
    firestore(){
        return {
            MemberData: firebaseDb.collection('MemberData'),    
            Transactions: firebaseDb.collection('Transactions'),             
        }
    },
    computed:{
        returnMemberWithLatestPayment(){
            try{
                let all = this.MemberData
                let withLatest = []
                all.forEach(a=>{
                    let latest = this.getLatestTransaction(a['.key'])
                    if(this.getLatestTransaction(a['.key']) !== undefined){
                        a.LatestTransaction = latest
                        a.LatestTransactionDate = latest.timestamp
                        a.LatestTransactionAmount = latest.Total
                        a.LatestTransactionType = latest.TransactionType,
                        a.LatestTransactionID = latest.TransactionID,
                        a.LatestTransactionOrNo = latest.OrNo,
                        a.LatestMF = latest.ManagementFee !== undefined ? latest.ManagementFee : 0
                        a.LatestSC = latest.ShareCapital !== undefined ? latest.ShareCapital : 0
                        a.LatestSavings = latest.SavingsDeposit !== undefined ? latest.SavingsDeposit : 0
                        withLatest.push(a)
                    }
                })

                let order = this.$lodash.orderBy(withLatest,b=>{
                    return b.LatestTransactionDate
                },'desc')
                console.log(order,'returnMemberWithLatestPayment')
                return order
            } catch (err){
                console.log(err,'returnMemberWithLatestPayment')
                return []
            }
        }
    },
    methods:{
        getLatestTransaction(id){
            let transactions = this.Transactions.filter(a=>{
                return a.MemberID == id
            })

            let latest = this.$lodash.orderBy(transactions,q=>{
                return q.timestamp.toDate()
            },'desc')[0]

            return latest
        }
    }
}
</script>
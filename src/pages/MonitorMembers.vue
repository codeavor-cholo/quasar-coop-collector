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
                    :label="`${member.FirstName} ${member.LastName} - ${member['.key']}`"
                    :label-lines="2"
                    header-class="text-grey-10"
                    v-for="member in filteredItems" :key="member['.key']" 
                    :caption="member.LatestTransactionDate !== 0 ? 'Last Transaction - '+$moment(member.LatestTransactionDate.toDate()).fromNow() : ''"
                    
                >
                <q-separator spaced />
                <q-item-label header class="bg-grey-1">Latest Transactions</q-item-label>                
                <q-item v-for="(t,i) in member.LatestTransactions" :key="t['.key']" class="bg-grey-1" v-show="i < 5">
                    <q-item-section>
                    <q-item-label><b>{{t.LatestTransactionType}}</b> - OR#.{{t.LatestTransactionOrNo}}</q-item-label>
                    <q-item-label caption>
                        <span v-show="t.LatestMF" class="q-mr-sm">MF: ₱{{t.LatestMF}}</span>
                        <span v-show="t.LatestMF" class="q-mr-sm">SC: ₱{{t.LatestSC}}</span>
                        <span v-show="t.LatestSavings" class="q-mr-sm">Savings: ₱{{t.LatestSavings}}</span>
                    </q-item-label>
                    </q-item-section>

                    <q-item-section side top>
                        <q-item-label caption>{{$moment(t.LatestTransactionDate.toDate()).format('LL')}}</q-item-label>
                    </q-item-section>
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
        filteredItems() {
            return this.returnMemberWithLatestPayment.filter(item => {
                let nameID = `${item['.key']}${item.FirstName}${item.LastName}`
                return nameID.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            })
        },
        returnMemberWithLatestPayment(){
            try{
                let all = this.MemberData
                let withLatest = []
                all.forEach(a=>{
                    let latest = this.getLatestTransaction(a['.key'])
                    if(this.getLatestTransaction(a['.key']) !== undefined && latest.length > 0){
                        a.LatestTransactions = []
                        latest.forEach(s=>{
                            s.LatestTransaction = s
                            s.LatestTransactionDate = s.timestamp
                            s.LatestTransactionAmount = s.Total
                            s.LatestTransactionType = s.TransactionType,
                            s.LatestTransactionID = s.TransactionID,
                            s.LatestTransactionOrNo = s.OrNo,
                            s.LatestMF = s.ManagementFee !== undefined ? s.ManagementFee : 0
                            s.LatestSC = s.ShareCapital !== undefined ? s.ShareCapital : 0
                            s.LatestSavings = s.SavingsDeposit !== undefined ? s.SavingsDeposit : 0
                            a.LatestTransactions.push(s)
                        })
                        let first = {...this.$lodash.first(latest)}
                        a.LatestTransactionDate = first.timestamp
                        withLatest.push(a)
                    } else {
                        a.LatestTransactionDate = 0
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
            },'desc')

            return latest
        }
    }
}
</script>
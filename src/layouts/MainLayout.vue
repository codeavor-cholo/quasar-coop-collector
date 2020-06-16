<template>
  <q-layout view="hHh lpR fFf">

    <q-header class="bg-teal text-white">
      <q-toolbar>
        <!-- <q-btn dense flat round icon="menu" @click="left = !left" /> -->

        <q-toolbar-title >
          <q-avatar>
            <img src="statics/New-GSIS-Cooperative.png">
          </q-avatar>
          <span style="font-size:.8em" class="q-pl-sm">New GSIS Cooperative</span>
        </q-toolbar-title>
        <q-btn color="white" flat icon="settings" dense @click="signOut"/>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="left" side="right" bordered>
      <q-list>
        <q-item class="bg-grey-2 q-pa-md" clickable v-ripple to="/profile" active-class="text-teal">
          <q-item-section avatar>
            <q-avatar color="teal" class="text-white">
              M
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <div class="text-weight-bold">MEMBER NAME</div>
            <div class="text-caption text-uppercase">driver / operator</div>
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/viewTransations/savings" active-class="text-teal bg-grey-2">
          <q-item-section avatar>
            <q-icon color="teal" name="account_balance" />
          </q-item-section>
          <q-item-section>Savings</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/viewTransations/cashadvance" active-class="text-teal bg-grey-2">
          <q-item-section avatar>
            <q-icon color="teal" name="money" />
          </q-item-section>
          <q-item-section>Cash Advance</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/viewTransations/all" active-class="text-teal bg-grey-2">
          <q-item-section avatar>
            <q-icon color="teal" name="payment" />
          </q-item-section>
          <q-item-section>Transactions</q-item-section>
        </q-item>
        <q-item clickable v-ripple active-class="text-teal bg-grey-2" to="/drivers">
          <q-item-section avatar>
            <q-icon color="teal" name="people" />
          </q-item-section>
          <q-item-section>Drivers</q-item-section>
        </q-item>
        <q-item clickable v-ripple active-class="text-teal bg-grey-2">
          <q-item-section avatar>
            <q-icon color="teal" name="chat" />
          </q-item-section>
          <q-item-section>Chat Administrator</q-item-section>
        </q-item>
        <q-item clickable v-ripple active-class="text-teal bg-grey-2" to="/login">
          <q-item-section avatar>
            <q-icon color="teal" name="power_settings_new" />
          </q-item-section>
          <q-item-section>Sign Out</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-grey-3 text-grey-8" >
        <q-tabs
          v-model="tab"
          no-caps
          dense
        >
          <q-route-tab name="mails" icon="home" label="Home" class="tabs1" to="/account"/>
          <q-route-tab name="movies" icon="payment" label="Payment" class="tabs1" to="/addpayment"/>
          <q-route-tab name="alarms" icon="people" label="Members" class="tabs1" to="/notifications"/>
          <q-tab name="menu" icon="menu" label="Menu" class="tabs1" @click="left = !left"/>
        </q-tabs>
    </q-footer>

  </q-layout>
</template>
<style>
  
  .tabs1 div .q-tab__label {
    font-size: .7em;
  }
</style>
<script>
import { firebaseDb, firebaseAuth, firefirestore } from 'boot/firebase'
export default {
  data () {
    return {
      left: false,
      tab: 'mails',
      memberid: '',
      accountLoggedIn: {}
    }
  },
  firestore () {
    return {
      MemberData: firebaseDb.collection('MemberData'),
    }
  },
  created(){
    let self = this
    firebaseAuth.onAuthStateChanged(function(user) {
        
        if (user) {
          let gg = {...user}
          console.log('createdUser',user)
          console.log('createdUser',user.uid)
          let username = gg.email.toString().split('@')
          self.memberid = username[0].toUpperCase()

        } else {
            // No user is signed in.
            self.$router.push('/')
        }
    })
  },
  computed:{
    returnMemberData(){
      try {
        console.log(this.MemberData.filter(a=>{
          return this.memberid == a['.key']
        })[0],'member')
        return this.MemberData.filter(a=>{
          return this.memberid == a['.key']
        })[0]
      } catch (error) {
        console.log(error,'err')
        return {}
      }
    }
  },
  methods:{
    signOut(){
      this.$q.dialog({
          title: `Are you sure you want to logout?`,
          type: 'negative',
          color: 'teal',
          textColor: 'white',
          icon: 'warning',
          ok: 'Ok',
          cancel: 'Cancel'
          
      }).onOk(()=>{
        firebaseAuth.signOut()
          .then(() => {
            this.$router.push('/')
          })
      })
    }
  }
}
</script>
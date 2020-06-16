import Vue from 'vue'
import VueFirestore from 'vue-firestore'
import Swal from 'sweetalert2'


Vue.use(VueFirestore);

import {firebaseAuth, firebaseDb } from 'boot/firebase'

const state = {
    userDetails: {},
    Loading: true,
    Designation: ''
}

const mutations = {
    setUserDetails(state, payload) {
        state.userDetails = payload
    },
    setLoading(state, payload){
        state.Loading = payload
    },
    setDesignation(state, payload) {
        state.Designation = payload.Designation
    }
}

const actions = {
    loginUser({commit}, payload){
        commit('setLoading', true)
        firebaseAuth.signInWithEmailAndPassword(payload.email, payload.password)
        .then( response => {
            console.log(response)
            if(response != null){
                this.$router.replace('/')
            }
        })
        .catch(function(error) {
          console.log(error, 'errore was')
            Swal.fire({
                title: 'Error!',
                text: error,
                icon: 'error',
                confirmButtonText: 'Close'
              })
            commit('setLoading', false)
          })
    },
    logoutUser(){
        firebaseAuth.signOut();
        localStorage.removeItem('Designation')
        localStorage.removeItem('id')
        this.$router.replace('/')
    },
    handleAuthStateChanged({commit}){
        commit('setLoading', true)
        firebaseAuth.onAuthStateChanged( user => {
            if (user) {
              //userlogin
              let userId = firebaseAuth.currentUser.uid
              firebaseDb.collection("Users").doc(userId).get().then(function(doc) {
                    if (doc.exists) {
                        let userDetails = doc.data()
                        commit('setUserDetails', {
                            FirstName: userDetails.FirstName,
                            LastName: userDetails.LastName,
                            Email: userDetails.Email,
                            Designation: userDetails.Designation,
                            MemberID: userDetails.MemberID,
                            userId: userId
                        })
                        let dsg = userDetails.Designation

                        if(dsg == 'Admin'){
                            localStorage.setItem('Designation', 'e3afed0047b08059d0fada10f400c1e5')
                        }else if(dsg == 'Collector'){
                            localStorage.setItem('Designation', '8fc330d76e990ab6964af08ea1e47d2e')
                        }else if(dsg == 'Driver' || dsg == 'Operator'){
                            localStorage.setItem('Designation', '858ba4765e53c712ef672a9570474b1d')
                        }

                            commit('setDesignation', {
                                Designation: userDetails.Designation
                                }
                            )
                    }
                    else
                    {
                        // doc.data() will be undefined in this case
                        console.log("No such document!");
                    }

                }).then(() => {
                    commit('setLoading', false)
                })
                .catch(function(error) {
                    console.log(error)
                    commit('setLoading', false)
                })
            }
            else {
                //userlogout
                commit('setUserDetails', {})
                commit('setLoading', false)
            }
          })
    }
}
const getters = {
    Loading: state => {
        return state.Loading
    },
    Designation: state => {
        return state.Designation
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}

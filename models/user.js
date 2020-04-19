var stripe = require('stripe')('sk_test_uHy1aZCgeywUaQMX8J2qqJns00X4HRijn9');
const uuid = require('uuid')

const fbAdmin = require('../utils/firebase-admin');

class User {
    constructor(id) {
        this.id = id
    }

    async fetchUser() {
        this.document = (await fbAdmin.database().ref('/users/').child(this.id).once('value')).val()
        return this.document;
    }

    getUserPayout() {
        return this.document.payout
    }

    async chargeUser(charges) {
        const chargeID = uuid.v4()
        // Charge user with credit card. and push to DB
        console.log(`USER ${this.id} was charged USD${charges.perMemberCharges} for group ${charges.groupID} with new chargeID ${chargeID}`)
        return chargeID;
    }

    static async removeCard(custID, cardID) {
        // fetch user details from fb here
        console.log('deletion');

        stripe.customers.deleteSource(
            custID,
            cardID,
            function (err, confirmation) {
                // asynchronously called
                console.log(err, confirmation);
            }
        );
    }

    static async retreiveCards(custID) {

        const paymentMethods = await stripe.customers.listSources(
            custID,
            { object: 'card', limit: 3 },
        );
        return paymentMethods;
    }

    async getPaymentIntent(custID, pmID, cardID) {

        if (!custID) {
            const customer = await stripe.customers.create({
                description: this.id,

            });
            await fbAdmin.database().ref('users').child(this.id).child('stripeID').set(customer.id);
            // console.log(customer);
            const setupIntent = await stripe.customers.createSource(
                custID, { source: cardID });

            console.log(setupIntent);
            return setupIntent;
        } else {
            if (pmID) {
                User.removeCard(custID, pmID);
            }
            const setupIntent = await stripe.customers.createSource(
                custID, { source: cardID });

            console.log(setupIntent);

            return setupIntent;
        }

    }

    static calculateAmount(amount, users) {
        const SERVICE_CHARGES = 0.02;
        let groupMonthlyCharges = Number((amount * SERVICE_CHARGES));
        groupMonthlyCharges = Number(amount) + Number(groupMonthlyCharges);
        let perMemberCharges = groupMonthlyCharges / users;
        return perMemberCharges;

    }

    static totalAmount(amount) {
        const SERVICE_CHARGES = 0.02;
        let groupMonthlyCharges = Number((amount * SERVICE_CHARGES));
        groupMonthlyCharges = Number(amount) + Number(groupMonthlyCharges);
        return groupMonthlyCharges;
    }

    static async getUsersForGroups(group) {
        if (group.members) {
            let MemberPromises = [];
            let members = []
            let date = Date.now();
            let perUserAmount = User.calculateAmount(group.amount, Object.keys(group.members).length + 1)
            Object.keys(group.members).forEach((member) => {
                MemberPromises.push(fbAdmin.database().ref('users').child(member).orderByKey().once('value').then((snapshot) => {
                    members.push(snapshot.val());
                }));
            });
            Promise.all(MemberPromises).then(() => {
                let PaymentPromises = [];
                members.forEach(member => {
                    console.log('Member', member);
                    try {
                        if (member.card) {
                            PaymentPromises.push(
                                stripe.charges.create(
                                    {
                                        amount: perUserAmount * 1000,
                                        currency: 'usd',
                                        customer: member.stripeID,
                                        description: group.name + ' Charges ',
                                    },
                                    function (err, charge) {
                                        // asynchronously called
                                        console.log(charge);
                                        if (err) {
                                            console.log(err.message)
                                            fbAdmin.database().ref('PendingPayments').child(member.uid).child(group.uid).child(group.date).set({ amount: perUserAmount, error: err.message, group: group.key,date });
                                            fbAdmin.database().ref('PendingPaymentsByGroup').child(group.key).child(member.uid).child(group.date).set({ amount: perUserAmount, error: err.message, group: group.key,date });
                                        } else {
                                            fbAdmin.database().ref('transactions').child(member.uid).child(group.date).set({ amount: perUserAmount, charge, group: group.key, received: false, transferredTo: group.uid,date });
                                            fbAdmin.database().ref('transactions').child(group.uid).child(group.date).set({ amount: perUserAmount, charge, group: group.key, received: true, transferredFrom: member.uid,date });

                                        }
                                    }
                                )
                            )
                        } else {
                            fbAdmin.database().ref('PendingPayments').child(member.uid).child(group.key).child(group.date).set({ amount: perUserAmount, error: 'Card not available',date });

                        }
                    } catch (ex) {
                        console.log(ex, ex.message);
                        fbAdmin.database().ref('PendingPayments').child(member.uid).child(group.key).child(group.date).set({ amount: perUserAmount, error: ex.message,date });

                    }
                })
                // PaymentPromises.push()
                // Promise.all()
            })

        } else {

        }
    }

    static async getGroupsToCharge() {
        fbAdmin.database().ref('groups').child('-M4ylID-1P77vhIHDbmh').orderByKey().once('value').then((snapshot) => {

            User.getUsersForGroups(snapshot.val());
        });
    }
}

module.exports = User;
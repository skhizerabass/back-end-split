const uuid = require('uuid')

const fbAdmin = require('../utils/firebase-admin')
const Paypal = require('../utils/paypal-setup')
const User = require('./user')

module.exports = class Payout {

    constructor(beneficiaryID, groupID, payer, payoutAmount, userChargeID) {
        this.id = 'payout-' + parseInt((Math.random() * 1000000000000000).toString())
        this.groupID = groupID
        this.payer = payer
        this.payoutAmount = payoutAmount
        this.userChargeID = userChargeID
        this.beneficiary = new User(beneficiaryID)
        console.log("NEW PAYOUT INITIATED AT: ", new Date().getTime())
    }

    async execute() {
        let scope = this
        let response = await Paypal.executePayout(this.request)
        // console.log(response.batch_header.payout_batch_id)
        setTimeout(async () => {
            let result = await Paypal.getPayoutStatus(response.batch_header.payout_batch_id)
            let data = {
                id: scope.id,
                group: scope.groupID,
                transferredFrom: scope.payer,
                amount: scope.payoutAmount,
                userChargeID: scope.userChargeID,
                received:true,
                date: Date.now(),
                paypalData: result.items['0']
            }
            fbAdmin.database().ref('transactions').child(this.beneficiary.id).child(this.id).set(data)
        }, 10000)
        if(!this.validatePayout()) {
            // payout here
            return true;
        } else return false; // Payout data was not validated
    }

    validatePayout() {
        if(!(this.userChargeID && this.beneficiary && this.groupID && this.payer && this.payoutAmount)) {
            console.log("Payout object initiated not valid")
            console.log("userChargeID", this.userChargeID)
            console.log("beneficiary", this.beneficiary)
            console.log("groupID", this.groupID)
            console.log("payer", this.payer)
            console.log("payoutAmount", this.payoutAmount)
            return false;
        }
    }

    static async connectPayoutPaypal (user, payoutAddress, addressType) {
        await fbAdmin.database().ref('users').child(user.id)
            .child('payout').set({
                service: "paypal",
                address: payoutAddress,
                addressType    
            });
    }

    async initRequest() {
        await this.beneficiary.fetchUser()
        let payoutAccount = this.beneficiary.getUserPayout();
        this.request = Paypal.createPayoutRequest(this.id, payoutAccount.addressType, this.payoutAmount, payoutAccount.address, this.groupID)
    }
}

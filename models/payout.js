const uuid = require('uuid')

const fbAdmin = require('../utils/firebase-admin')


module.exports = class Payout {

    constructor(beneficiary, groupID, payer, payoutAmount, userChargeID) {
        this.id = uuid.v4();
        this.beneficiary = beneficiary
        this.groupID = groupID
        this.payer = payer
        this.payoutAmount = payoutAmount
        this.userChargeID = userChargeID
        console.log("NEW PAYOUT INITIATED AT: ", new Date().getTime())


    }

    async execute() {
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

    initRequest() {
        
    }
}

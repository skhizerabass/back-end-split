const uuid = require('uuid')

const fbAdmin = require('../utils/firebase-admin')


module.exports = class Charge {

    constructor() {
        this.identifier = uuid.v4();
        console.log("NEW CHARGE INITIATED AT: ", new Date().getTime())
    }

    async getScheduledPayoutGroups() {
        const date = new Date()
        this.groupsToChargeSnap = await fbAdmin.database().ref('groups').orderByChild('date').startAt(0).endAt(date.getTime()).once("value")
        return this.groupsToCharge = this.groupsToChargeSnap.val()
    }

    async updateGroupNotCharged(groupSnap) {
        let nextChargeDate = null;
        if(groupSnap.val().cycle === 'Monthly') {
            nextChargeDate = new Date().setMonth(new Date().getMonth() + 1)
        } else {
            let day = 60000 * 1440;
            nextChargeDate = new Date().getTime() + day * 7
        }
        groupSnap.child('cycle').set(nextChargeDate)
    }
}

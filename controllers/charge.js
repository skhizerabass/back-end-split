const Charge = require('../models/charge')
const User = require('../models/user');
const Payout = require('../models/payout')

const chargeGroups = async () => {
    const charge = new Charge()
    if(!(await charge.getScheduledPayoutGroups())) {
        console.log("NO SCHEDULED GROUPS TO CHARGE")
        return;
    } else {
        console.log("GROUPS TO CHARGE AT: ")
        charge.groupsToChargeSnap
            .forEach( groupSnap => {
                console.log("\n//// CAHRGING NEW GROUP")
                const groupToCharge = groupSnap.val()
                // If group has no members,
                // No charges are deducted and new date to charge the group is set in the group firebase node
                if(!groupToCharge.members) {
                    
                    console.log(`NO MEMBERS TO CHARGE FOR groupID ${groupSnap.key}`)
                    // payout.updateGroupNotCharged(groupSnap)
                    return;
                }

                groupToCharge.key = groupSnap.key
                console.log("Key: ", groupToCharge.key)
                let charges = _calcCharges(groupToCharge)
                groupSnap.child('members').forEach( memberSnap => {
                    let userToCharge = new User(memberSnap.key)
                    userToCharge.chargeUser(charges)
                        .then( userChargeID => {
                            if(userChargeID) {
                                let payout = new Payout(charges.beneficiary, charges.groupID, memberSnap.key,
                                    charges.beneficiaryPayoutAmountPerMember, userChargeID)
                                payout.execute().then(result => {
                                    if(!result) console.log("ERROR WHILE PAYOUT: ", payout);
                                    else console.log("SUCCESSFUL PAYOUT: ", payout)
                                })
                            }
                        });
                })
            })
    }
}

const _calcCharges = (group) => {
    const SPLITPAL_SERVICE_CHARGES = 0.02; // percentage
    const PAYMENT_CHANNEL_SERVICE_CHARGES = 0; // dollars per payment to memeber
    const charges = {
        groupID: group.key,
        beneficiary: group.uid
    }
    charges.totalCharges = parseInt(group.amount);
    charges.membersCount = Object.keys(group.members).length + 1 // Plus 1 is for the beneficiary
    charges.serviceCharges =  charges.totalCharges  * SPLITPAL_SERVICE_CHARGES
    charges.paymentChannelServiceCharges = PAYMENT_CHANNEL_SERVICE_CHARGES * charges.membersCount
    charges.netTotalCharges = charges.totalCharges + charges.serviceCharges + charges.paymentChannelServiceCharges // dollars
    charges.perMemberCharges = charges.netTotalCharges / charges.membersCount;
    charges.beneficiaryPayoutAmountPerMember = charges.totalCharges / charges.membersCount
    // console.log("Payment: ", charges)
    return charges
    // groupMembers.forEach( member => {
    //     if(currentGroup.creator.uid !== member.uid) {
    //         await member.charge(perMemberCharges)
    //     }
    // })
    // await currentGroup.creator.payout(groupMonthlyCharges - perMemberCharges)
}

chargeGroups()
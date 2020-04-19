const fbAdmin = require('../utils/firebase-admin')
const Payout = require('../models/payout')
const User = require('../models/user');

exports.getPayoutAccount = async (req, res, next) => {
    try {
        const { uid } = req.body
        let user = new User(uid);
        if(!(await user.fetchUser())) {
            let error = new Error("UID provided was not correct");
            error.code = 'firebase_uid_not_found';
            error.status = 404;
            throw error
        }
        if(user.document.payout) {
        res.status(200).json({
            data: user.document.payout ,
            status: 'success'
        })
        } else {
            let error = new Error("Payout account not connected");
            error.code = 'payout_account_not_connected';
            error.status = 404;
            throw error
        }
    } catch (e) {
        console.log("ERROR: ", e);
        res.status(e.status).json({
            message: e.message,
            code: e.code,
            status: "Failed"
        })
    }
}

exports.connectPayoutAccount = async (req, res, next) => {
    try {
        const { uid, service, payoutAddress, addressType } = req.body
        let user = new User(uid);
        if(!(await user.fetchUser())) {
            let error = new Error("UID provided was not correct");
            error.code = 'firebase_uid_not_found';
            error.status = 404;
            throw error
        }
        if(service === 'paypal') {
            await Payout.connectPayoutPaypal(user, payoutAddress, addressType);
        } else {
            let error = new Error(service + " as a payout service is not yet supported");
            error.code = 'provided_payout_service_not_supported';
            error.status = 404;
            throw error
        }

        res.status(200).json({
            status: 'success'
        });
    } catch (e) {
        console.log("ERROR: ", e);
        res.status(e.status).json({
            message: e.message,
            code: e.code,
            status: 'Failed'
        })
    }
}



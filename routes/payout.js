var router = require('express').Router();

const paypalController = require('../controllers/payout')

/* GET users listing. */
router.post('/get-payout-account', paypalController.getPayoutAccount)
router.post('/connect-payout-account', paypalController.connectPayoutAccount);


module.exports = router;

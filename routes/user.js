var router = require('express').Router();

const userController = require('../controllers/user')

/* GET users listing. */
router.post('/getPaymentIntent', userController.getPayment);
router.post('/cards', userController.getCards);
router.post('/removeCard', userController.removeCards);

module.exports = router;

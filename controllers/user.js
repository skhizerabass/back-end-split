const userModel = require('../models/user')


exports.getUser = async (req, res) => {
    const { userId } = req.body
    const user = new userModel(userId)
    await user.fetchUserDetails()
    res.status(200).json({
        id: user.id,
        name: user.name,
        cards: user.dards
    })
}

exports.getPayment = async (req, res)=>{
    const {custID,uid,pmID,cardID} = req.body;
    // console.log(req.body);
    const user = new userModel(uid);
    user.getPaymentIntent(custID,pmID,cardID).then(setupIntent=>{
        res.status(200).json({setupIntent});
    })

}


exports.getCards = async (req, res)=>{
    const {custID} = req.body;
    // console.log(req.body);
    console.log(custID);
    userModel.retreiveCards(custID).then(result=>{
        res.status(200).json({result});
    })

}


exports.removeCards = async (req, res)=>{
    const {pmID} = req.body;
    // console.log(req.body);
    // console.log(custID);
    userModel.removeCard(pmID).then(result=>{
        res.status(200).json({result});
    })

}
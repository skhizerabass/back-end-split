const paypal = require('@paypal/payouts-sdk');

const { client_id, client_secret } = require('./paypal-config.json')


// Creating an environment
let clientId = client_id;
let clientSecret = client_secret;
let environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
let client = new paypal.core.PayPalHttpClient(environment);

let createPayoutRequest = (txID, recipientType, amount, receiver, groupID) => {
    let requestBody = {
        "sender_batch_header": {
            "recipient_type": recipientType, //"EMAIL",
            "email_message": "SDK payouts test txn",
            "note": "Enjoy your Payout!!",
            "sender_batch_id": txID, //"Test_sdk_1w",
            "email_subject": "This is a test transaction from SDK"
        },
        "items": [{
            "amount": {
                "currency": "USD",
                "value": amount.toString(), //"1.00"
            },
            "receiver": receiver, //"payout-sdk-1@paypal.com",
            "sender_item_id": groupID, //"Test_txn_1"
        }]
    }
    let _request = new paypal.payouts.PayoutsPostRequest();
    _request.requestBody(requestBody);
    return _request;
}



// Call API with your client and get a response for your call
let executePayout = async function (request) {
    // const id = new uuid.v4()
    // let request = createPayoutRequest('Test_sdk_1w', 'EMAIL', 10, "payout-sdk-1@paypal.com")
    let response = await client.execute(request);
    // console.log(`\n\nResponse: ${JSON.stringify(response)}`);
    // If call returns body in response, you can get the deserialized version from the result attribute of the response.
    // console.log(`\n\nPayouts Create Response: ${JSON.stringify(response.result)}`);
    return response.result
}


let getPayoutStatus =  async function(batchId) {
    request = new paypal.payouts.PayoutsGetRequest(batchId);
    request.page(1);
    request.pageSize(10);
    request.totalRequired(true);
    // Call API with your client and get a response for your call
    let response = await client.execute(request);
    // console.log(`Response: ${JSON.stringify(response)}`);
    // If call returns body in response, you can get the deserialized version from the result attribute of the response.
    // console.log(`Payouts Batch:`, response.result);
    return response.result;
}

module.exports = { executePayout, createPayoutRequest, getPayoutStatus }
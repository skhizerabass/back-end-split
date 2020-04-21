const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const userRouter = require('./routes/user')
const payoutRouter = require('./routes/payout')
// const userModal = require('./models/user');

const PORT = 6000;
const app = express();
app.use(bodyParser.json()); 
app.use(cors());
// userModal.getGroupsToCharge();

// console.log('wow');
/////////////////////////////////////////
//////// Add other routers here /////////
/////////////////////////////////////////
app.use('/', (req, res, next) => {
    console.log("New request: ", new Date());
    next()
})
app.use('/api/test', (req, res) => res.status(200).send('Hello world!'))
app.use('/api/user', userRouter); 
app.use('/api/payout', payoutRouter);
app.listen(PORT, () => console.log("Server started at: ", new Date()))
/////////////////////////////////////////
/////////////////////////////////////////



// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userModal = require('./models/user');
const userRouter = require('./routes/user')

const PORT = 8000
const app = express();
app.use(bodyParser.json()); 
app.use(cors());
app.listen(PORT)

// userModal.getGroupsToCharge();

// console.log('wow');
/////////////////////////////////////////
//////// Add other routers here /////////
/////////////////////////////////////////
app.use('/api/user', userRouter); 
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

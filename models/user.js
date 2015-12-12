var mongoose = require('mongoose'),
Schema = mongoose.Schema,
bcrypt = require('bcrypt'),
SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
    username: { type: String, required: true, unique: true, index: { unique: true } },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true},
    created: { type: Date, default: Date.now },
    equation: { type: String, required: true }
});

UserSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(ieq, candidatePassword, cb) {
    var user = this;
    var doubleFit=[];
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        var isUser = true;
        if (isMatch){
            var fit = user.equation.split(",").map(Number);
            console.log(fit);
            doubleFit.push(fit.slice(0, fit.length/2));
            doubleFit.push(fit.slice(fit.length/2, fit.length));
            console.log(doubleFit);
            isUser = fits(ieq, doubleFit);
            cb(null, isUser);
        }
    });
};


function fits(newData,fit) {
  diffs = newData.slice(1,newData.length).map(function(y,j){return y-newData[j];});
  //ii = 0;
  for (var ii=0; ii < diffs.length; ii++) {
    if(diffs[ii]<fit[0][ii] || diffs[ii]>fit[1][ii]){
      return false;
    }
  }
  return true;
}


module.exports = mongoose.model('User', UserSchema);

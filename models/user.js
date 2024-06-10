const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
    },
    mobile: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        required: true,
        type: String
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted: {
            type: Boolean,
            default: false 
    }
});

UserSchema.pre('save', async function(next){
    const person = this;

    // hash the password only if it has modified or is new
    if(!person.isModified('password')) return next();

    try {
        //hash password generation
        const salt = await bcrypt.genSalt(10);

        //hash password
        const hashPassword = await bcrypt.hash(person.password, salt);

        //override plan password with the hashed one
        person.password = hashPassword;
        next();
    } catch (err) {
        return next(err);
    }
})

UserSchema.methods.comparePassword = async function(candidatePassword){
    try {
        //use bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (err) {
        throw err;
    }
}

//create person model
const User = mongoose.model('person', UserSchema);
module.exports = User;
const mongoose = require('mongoose') 

const Register = mongoose.model('Register', {
    namaLengkap: {
        type: String,
        required: true   
    },
    nim: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
})


module.exports = Register
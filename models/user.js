const mongoose = require('mongoose') 

const User = mongoose.model('User', {
    namaLengkap: {
        type: String,
        required: true   
    },
    nim: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})



module.exports = User
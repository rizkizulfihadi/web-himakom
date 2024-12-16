const mongoose = require('mongoose') 

const Mahasiswa = mongoose.model('Mahasiswa', {
    nama: {
        type: String,
        required: true   
    },
    nim: {
        type: String,
        required: true
    },
    kedudukan: {
        type: String,
        required: true
    },
    prodi: {
        type: String,
        required: true
    },
    alamat: {
        type: String,
        required: true
    },
    tanggalLahir: {
        type: String,
        required: true
    },
    moto: {
        type: String,
    },
    instagram: {
        type: String
    },
    twitter: {
        type: String
    },
    github: {
        type: String
    },
    line: {
        type: String
    },
    facebook: {
        type: String
    },
    image:{
        type: String,
        
    }
})


module.exports = Mahasiswa
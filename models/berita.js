const mongoose = require('mongoose') 

const Berita = mongoose.model('Berita', {
    judul: {
        type: String,
        required: true   
    },
    deskripsi: {
        type: String,
        required: true
    },
    isiBerita: {
        type: String,
        required: true
    },
    tanggalDibuat: {
        type: String,
    },
    penulis: {
        type: String,
        required: true
    },
    thumbnail :{
        type: String,
        required: true
    },
    tanggalDiubah :{
        type: String,
    },
    dieditOleh:{
        type: String
    }
})



module.exports = Berita
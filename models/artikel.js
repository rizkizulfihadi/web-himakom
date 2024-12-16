const mongoose = require('mongoose') 

const Artikel = mongoose.model('Artikel', {
    judul: {
        type: String,
        required: true   
    },
    deskripsi: {
        type: String,
        required: true
    },
    isiArtikel: {
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



module.exports = Artikel
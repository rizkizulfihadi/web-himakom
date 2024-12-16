const mongoose = require('mongoose') 

const Gallery = mongoose.model('Gallery', {
    kategori: {
        type: String,
        required: true   
    },
    ditambahOleh: {
        type: String,
        required: true
    },
    tanggal: {
        type: String,
        required: true
    },
    foto :{
        type: String,
        required: true
    },
})



module.exports = Gallery
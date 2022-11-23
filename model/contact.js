const db = require('mongoose')

const Contact = db.model('Contact',{
    nama: {
        type: String,
        required: true
    },
    nohp: {
        type: String,
        required: true
    },
    email: {
        type: String,
    }
})

module.exports = Contact
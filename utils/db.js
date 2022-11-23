const db = require('mongoose')
db.connect('mongodb://localhost:27017/wpu',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

// const ct1 = new Contact({
//     nama: 'Lookman',
//     nohp: '08123456789',
//     email: 'lookm@gmail.com'
// })
//
// ct1.save().then(c => console.log(c))
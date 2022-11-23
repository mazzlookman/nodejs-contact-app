const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const {body, check, validationResult} = require("express-validator");
const methodOverride = require('method-override')
require('./utils/db')
const Contact = require('./model/contact')

const session = require('express-session')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')

//Method Override
app.use(methodOverride('_method'))

app.set('view engine','ejs')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))

//konfigurasi flash message
app.use(cookieParser('secret'))
app.use(session({
    cookie : {maxAge:6000},
    secret : 'secret',
    resave: true,
    saveUninitialized: true
}))
app.use(flash())

app.get(
    '/',
    (req,res) => {
    res.render('index',{
        layout: 'layouts/main-layout',
        title: 'Halaman Home'
    })
})

app.get(
    '/about',
    (req,res) => {
    res.render('about',{
        layout: 'layouts/main-layout',
        title: 'Halaman About'
    })
})

app.get(
    '/contact',
    async (req,res)=>{
    // Contact.find().then(c => res.send(c))
    const contacts = await Contact.find()
    res.render('contact',{
        layout: 'layouts/main-layout',
        title: 'Halaman Contact',
        contacts,
        msg: req.flash('msg')
    })
})

app.get(
    '/contact/add',
    (req, res) =>{
    res.render('add-contact',{
        title: 'Tambah Data Contact',
        layout: 'layouts/main-layout',
    })
})

app.get(
    '/contact/:nama',
    async (req,res) => {
    const contact = await Contact.findOne({nama: req.params.nama})
    res.render('detail',{
        layout: 'layouts/main-layout',
        title: 'Detail Contact',
        contact
    })
})

app.get(
    '/contact/edit/:nama',
    async (req,res) => {
    const contact = await Contact.findOne({nama: req.params.nama})
    res.render('edit-contact',{
        title: 'Form Ubah Contact',
        layout: 'layouts/main-layout',
        contact
    })
})

app.post(
    '/contact',
    [
        body('nama').custom(async (value)=>{
            const duplikat = await Contact.findOne({nama : value})
            if(duplikat){
                throw new Error('Nama sudah digunakan')
            }
            return true
        }),
        check('email','Email tidak valid').isEmail(),
        check('nohp','No. HP tidak valid').isMobilePhone('id-ID')
    ],
    function(req,res){
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // return res.status(400).json({ errors: errors.array() });
            res.render('add-contact',{
                title: 'Tambah Contact',
                layout: 'layouts/main-layout',
                errors: errors.array()
            })
        }else{
            Contact.insertMany(req.body, (err,rsl) => {
                req.flash('msg','Data contact berhasil ditambahkan')
                res.redirect('/contact')
            })
        }
    })

app.delete(
    '/contact',
    async (req, res) => {
    await Contact.deleteOne({nama: req.body.nama}).then(()=>{
        req.flash('msg','Data contact berhasil dihapus')
        res.redirect('/contact')
    })
})

app.put(
    '/contact',
    [
        body('nama').custom(async (value, {req,res})=>{
            const duplikat = await Contact.findOne({nama: value})
            if(value !== req.body.oldNama && duplikat){
                throw new Error('Nama sudah digunakan')
            }
            return true
        }),
        check('email','Email tidak valid').isEmail(),
        check('nohp','No. HP tidak valid').isMobilePhone('id-ID')
    ],
    function(req,res){
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('edit-contact',{
                title: 'Ubah Contact',
                layout: 'layouts/main-layout',
                errors: errors.array(),
                contact: req.body
            })
        }else{
            Contact.updateOne(
                {_id: req.body._id},
                {
                    $set: {
                        nama: req.body.nama,
                        nohp: req.body.nohp,
                        email: req.body.email
                    }
                }).then(()=>{
                req.flash('msg','Data contact berhasil diubah')
                res.redirect('/contact')
            })
        }
    }
)

app.listen(3000,()=> {
    console.log('Mongo db app contact at http://localhost:3000')
})
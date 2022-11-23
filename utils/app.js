const express = require('express')
const app = express()
const ejs = require('ejs')
const expressEjsLayouts = require('express-ejs-layouts')
const { body, validationResult, check } = require('express-validator')
const session = require('express-session')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const c = require('../../Contact App ExpressJS/utils/contact')

app.set('view-engine','ejs')
app.use(expressEjsLayouts)
app.use(express.static('public')) //build in middleware
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

app.get('/', function(req, res){
    res.render('index.ejs',{
        title: 'Home',
        layout: 'layouts/main-layout.ejs'
    })
})

app.get('/about', function(req, res){
    res.render('about.ejs',{
        title: 'about',
        layout: 'layouts/main-layout.ejs'
    })
})

app.get('/contact', function(req, res){
    const contacts = c.loadContact()
    res.render('contact.ejs',{
        title: 'Daftar Contact',
        layout: 'layouts/main-layout.ejs',
        contacts,
        msg: req.flash('msg')
    })
})

app.get('/contact/add',function(req,res){
    res.render('add-contact.ejs',{
        title: 'Tambah Contact',
        layout: 'layouts/main-layout.ejs'
    })
})

app.post('/contact',
    [
        body('nama').custom((value)=>{
            const duplikat = c.duplicateCheck(value)
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
            res.render('add-contact.ejs',{
                title: 'Tambah Contact',
                layout: 'layouts/main-layout.ejs',
                errors: errors.array()
            })
        }else{
            c.addContact(req.body)
            //kirimkan flash message
            req.flash('msg','Data contact berhasil ditambahkan')
            res.redirect('/contact')
        }
})

app.get('/contact/delete/:nama',(req,res)=>{
    const ct = c.findContact(req.params.nama)
    if(!ct){
        res.status(404)
        res.send('404 Not found')
    }else{
        c.deleteContact(req.params.nama)
        req.flash('msg','Data contact berhasil dihapus')
        res.redirect('/contact')
    }
})

app.get('/contact/:nama', function(req,res){
    const contact = c.findContact(req.params.nama)
    res.render('detail.ejs',{
        title : 'Detail Contact',
        layout: 'layouts/main-layout.ejs',
        contact
    })
})

app.get('/contact/edit/:nama',(req,res) => {
    const contact = c.findContact(req.params.nama)
    res.render('edit-contact.ejs',{
        title: 'Form Ubah Contact',
        layout: 'layouts/main-layout.ejs',
        contact
    })
})

app.post('/contact/update',
    [
        body('nama').custom((value, {req,res})=>{
            const duplikat = c.duplicateCheck(value)
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
            // return res.status(400).json({ errors: errors.array() });
            res.render('edit-contact.ejs',{
                title: 'Ubah Contact',
                layout: 'layouts/main-layout.ejs',
                errors: errors.array(),
                contact: req.body
            })
        }else{
            // res.send(req.body)
            c.updateContacts(req.body)
            //kirimkan flash message
            req.flash('msg','Data contact berhasil diubah')
            res.redirect('/contact')
        }
})

app.listen(3000,()=>{
    console.log('Running in port http://localhost:3000')
})
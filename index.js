import express from 'express'
// import {dirname} from 'path'
// import {fileURLToPath} from 'url'
import {engine} from 'express-handlebars'
import {faker} from '@faker-js/faker'
import session from 'express-session'
import multer from 'multer'

const app = express()
const upload = multer({ dest: 'uploads/' })
// const __dirname = dirname(fileURLToPath(import.meta.url))

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

//Prijungiame persiunciamu duomenu atpazinima i req.body
app.use( express.urlencoded({
  extended: false
}))

//Prijungiame sesijos konfiguracija
app.use(session({
  secret: 'authentification',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 864000000
  }
}))

//Routeris
//GET
//POST
//PUT
//DELETE

app.get('/login', function(req, res) {
  let message = req.query.message
  //Tikriname ar vartotojas jau yra prisijunges
  if(req.session.loggedIn === true) {
    res.redirect('http://localhost:3001/people')
    return 
  }
  //Atvaizduojame prisijungimo sablona su kintamuoju
  res.render('login', {message})
})

app.post('/login', function(req, res) {
  let message = 'Įveskite prisijungimo duomenis'

  if(Object.keys(req.body).length > 0) {
    //Tikriname ar suvesti teisingi prisijungimo duomenys
    if(req.body.login != '' &&
       req.body.password != '' &&
       req.body.login === 'admin@inv.lt' &&
       req.body.password === '1234'
    ) {
      req.session.loggedIn = true
      req.session.userName = 'admin@inv.lt'

      res.redirect('http://localhost:3001/people')
      return 
    } else {
      message = 'Neteisingi prisijungimo duomenys'
    }
  }

  res.redirect('http://localhost:3001/login/?message=' + message)
})

app.get('/people', function (req, res) {

  //Panaikiname sesijos reiksmes individualiai kiekvienam indeksui
  // req.session.loggedIn = null
  // req.session.userName = null

  //Panaikiname visa sesija 
  //req.session.destroy()

  if(req.session.loggedIn) {
    let zmones = []

    for(let i = 0; i < 100; i++) {
      let address = faker.address.streetAddress() + ', ' + 
                    faker.address.city() + ', ' +
                    faker.address.country()
      
      zmones.push(
        {
          vardas: faker.name.firstName(),
          pavarde: faker.name.lastName(),
          adresas: address,
          telefonas: faker.phone.phoneNumber(),
          emailas: faker.internet.email()
        }
      )
    }
    res.render('people', {zmones, user: req.session.userName})
  
  } else {

    res.redirect('/login')

  }

})

//Atsijungimo nuoroda
app.get('/logout', function (req, res) {
  req.session.loggedIn = null
  req.session.userName = null
  
  res.redirect('/login')
})

//Post Upload 
app.post('/post-upload', upload.single('photo'), function(req, res) {
  //Informacija apie perduodama faila
  console.log(req.file)
  
  if(req.body.post_title === undefined ||
     req.body.post_content === undefined ||
     req.body.date === undefined
  ) {
    res.send('Užpildyti ne visi laukeliai')
    return
  }

  res.send(req.body)
})


app.listen(3001) //Nurodomas portas ir inicijuojamas serveris
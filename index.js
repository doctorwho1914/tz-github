const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const GitHub = require('github-base');
const passport = require('./passport');

const app = express();

app.set('views', __dirname + '/templates');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'blah', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());


app.get('/', async (req, res) => {
    let user = req.user;
    if (user) {
        const github = new GitHub({
            token: user.accessToken
        });
        const repos = await github.get('/user/repos');

        user.repos = repos.body;
        res.render('home', {user: user});
    } else {
        res.render('auth');
    }
});

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback',
    passport.authenticate('github', {failureRedirect: '/login'}),
    (req, res) => {
        res.redirect('/');
    });

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('server started');
});

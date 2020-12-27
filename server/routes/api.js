const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const enums = require('../lib/enums');

const User = require('../models/user');
const Offer = require('../models/offer');
const { off } = require('../models/user');

const router = express.Router();
const ObjectId = require('mongoose').Types.ObjectId; 
const db = 'mongodb://localhost:27017/sales-board';
const secret = 'secret';
let tokens = [];


mongoose.connect(db,{ useFindAndModify: false }, err => {
    if (err) {
        console.error('Error ' + err);
    } else {
        console.log('connected to mongodb');
    }
})

router.post('/register', (req, res) => {
    const userData = req.body;
    const user = new User(userData);
    user.save((err, userRes) => {
        if (err) {
            console.error(err);
        }
        else {
            const payload = {
                subject: userRes._id
            };
            const token = jwt.sign(payload, secret);
            res.status(200).send({ token });
        }
    })
})

router.post('/login', (req,res) => {
    const userData = req.body;
    User.findOne({
        email: userData.email
    }, (err, user) => {
        if(err) {
            console.log(err);
        } else {
            if (!user) {
                res.status(401).send('Invalid user');
            } else {
                if (user.password !== userData.password) {
                    res.status(401).send('Invalid password');
                }
                else {
                    const payload = {
                        subject: user._id
                    };
                    const token = jwt.sign(payload, secret);
                    tokens.push(token);
                    res.status(200).send({ token });
                }
            }
        }
    })
})

router.delete('/logout', (req, res) => {
    
    const tokenToRemove = getToken(req)
    console.log('token-- ',tokenToRemove);
    if (tokenToRemove == null) {
        return res.sendStatus(401);
    }
    tokens = tokens.filter(token => token !== tokenToRemove);
    console.log('tokens', tokens);
    res.sendStatus(204);
})

router.get('/offers', authenticateToken, (req, res) => {
    Offer.find({},{title:1, type:1},(err, offers) => {
        if (err) console.error(err);
        else {
            res.status(200).send(offers);
        }
    })
})

router.post('/add-offer', authenticateToken, (req, res) => {
    const offerData = req.body;
    const offer = new Offer(offerData);
    offer.save((err, offerRes) => {
        if (err) {
            console.error(err);
        }
        else {
            res.status(200).send(offerRes);
        }
    })
})

router.get('/offer', authenticateToken, (req, res) => {
    const offerId = req.query.id;
    const userToken = getToken(req);
    setTimeout(function(){
        removeFromWatching(offerId, userToken);
    },10*1000*60)
    Offer.findById(offerId, (err, offer) => {
        if (err || !offer) {
            res.sendStatus(401);
        }
        if (!offer.viewing.includes(userToken)) {
            offer.viewing.push(userToken);
        }
        offer.save((saveErr, updatedOffer) => {
            if (saveErr) {
                res.sendStatus(401);
            }
            res.status(200).send(updatedOffer);
        })
    })
})
router.get('/watching', authenticateToken, (req,res) => {
    const offerId = req.query.id;
    const userToken = getToken(req);
    Offer.findById(offerId, (err, offer) => {
        if (err || !offer) {
            res.sendStatus(404);
        }

        return res.status(200).send({count: offer.viewing.length});
    })
})

router.put('/remvoe-watching', authenticateToken, async (req, res) => {
    const offerId = req.body.id;
    const userToken = getToken(req);

    try {
        await removeFromWatching(offerId, userToken);
        res.status(200).send({tatus: 'OK'});
    } catch (err) {
        res.sendStatus(400);
    }
})




function getToken (req) {
    const authHeader = req.headers['authorization'];
    return authHeader && authHeader.split(' ')[1];
}

function authenticateToken  (req, res, next) {
   const token = getToken(req);
    if (token == null) {
        return res.sendStatus(401);
    }
    if (!tokens.includes(token)) return res.sendStatus(403);

    jwt.verify(token, secret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    })
}

function removeFromWatching (offerId, tokenToRemove) {
    return Offer.findById(offerId, (err, offer) => {
        if (!err && offer) {
            offer.viewing = offer.viewing.filter(token => token !== tokenToRemove);
            return offer.save();
        }
    })
}

module.exports = router;
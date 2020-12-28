const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const enums = require('../lib/enums');

const User = require('../models/user');
const Offer = require('../models/offer');

const router = express.Router();
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

router.post('/register', async (req, res) => {
    const userData = req.body;
    try {
        UserInSystem = await User.findOne({email: userData.email}).exec()
        if (UserInSystem !== null) {
            res.statusMessage = 'This email address is already being used'
            return res.sendStatus(406);
        }
        const user = new User(userData);
        await user.save();
        res.status(200).send({status: 'OK'});
    } catch (err) {
        console.error(err);
        res.status(400).send(err);
    }   
})

router.post('/login', (req,res) => {
    const userData = req.body;
    User.findOne({
        email: userData.email
    }, (err, user) => {
        if(err) {
            console.log(err);
            res.status(400).send(err);
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
    if (tokenToRemove == null) {
        return res.sendStatus(401);
    }
    tokens = tokens.filter(token => token !== tokenToRemove);
    res.sendStatus(204);
})

router.get('/offers', authenticateToken, async(req, res) => {
    const type = req.query.type;
    const query = {};
    const resultsForRegular = 3;
    const resultForOthers = 20;
    const page = req.query.page ? req.query.page : 0;
    let count = 0;
    let offers = []
    if (type !== 'all') {
        query.type = type;
    };
    try {
        const user = await getUser(req.user.subject);
        if (user.type === enums.userTypes.regular) {
            if (type === 'all') {
                count = await Offer.countDocuments().exec();
                for (let typeToQuery of Object.values(enums.offerTypes)) {
                    query.type = typeToQuery
                    offers = [...offers, ...await Offer.find(query,{title:1, type:1}).skip(resultsForRegular * page).limit(resultsForRegular).exec()];

                }
            } else {
                count = await Offer.countDocuments(query).exec();
                offers = await Offer.find(query,{title:1, type:1}).skip(resultsForRegular * page).limit(resultsForRegular).exec();
            }
        } else {
            offers = await Offer.find(query,{title:1, type:1}).skip(resultForOthers * page).limit(resultForOthers).exec();
            count = await Offer.countDocuments(query).exec();
        }
        
        res.status(200).send({
            offers, 
            count, 
            userType: user.type});
    } catch (err){
        console.error(err);
        res.status(400).send(err);
    }
})

router.post('/add-offer', authenticateToken, (req, res) => {
    const offerData = req.body;
    const offer = new Offer(offerData);
    offer.save((err, offerRes) => {
        if (err) {
            console.error(err);
            res.status(400).send(err);
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
        res.status(200).send({status: 'OK'});
    } catch (err) {
        res.sendStatus(400);
    }
})

router.delete('/delete-offer', authenticateToken, async (req, res) => {
    const offerId = req.query.id;
    try {
        const user = await getUser(req.user.subject);
        const isNoOneWatching = await checkIsNoOneWatching(getToken(req), offerId);
        if (user.type !== enums.userTypes.admin || isNoOneWatching !== true) {
            res.statusMessage ="A user is watching the offer";
            return res.sendStatus(403);
        }

        await Offer.findByIdAndDelete(offerId).exec();
        
        res.status(200).send({tatus: 'OK'});
    } catch (err){
        console.log(err);
        res.status(400).send(err);
    }
})
router.put('/verify-offers', authenticateToken, async(req, res) => {
    const type = req.body.type.value;
    const offersIds = req.body.offersIds;
    const query = {};
    const resultsForRegular = 3;
    const resultForOthers = 20;
    const page = req.body.page ? req.body.page : 0;
    let offers = []
    let verified = true;
    if (type !== 'all') {
        query.type = type;
    };
    try {
        const user = await getUser(req.user.subject);
        if (user.type === enums.userTypes.regular) {
            if (type === 'all') {
                for (let typeToQuery of Object.values(enums.offerTypes)) {
                    query.type = typeToQuery
                    offers = [...offers, ...await Offer.find(query,{}).skip(resultsForRegular * page).limit(resultsForRegular).exec()];
                }
            } else {
                offers = await Offer.find(query,{}).skip(resultsForRegular * page).limit(resultsForRegular).exec();
            }
        } else {
            offers = await Offer.find(query,{}).skip(resultForOthers * page).limit(resultForOthers).exec();
        }
        if (offersIds.length === offers.length) {
            for (const [index, offer] of offers.entries()) {
                if (offersIds[index] !== offer._id.toString()) {
                    verified = false;
                    break;
                }
            }
        } else {
            verified = false
        }
        
        res.status(200).send({ verified });
    } catch (err){
        console.error(err);
        res.status(400).send(err)
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

function getUser (userId) {
    return User.findById(userId);
}

async function checkIsNoOneWatching (token, offerId) {
    try {
        const offer = await Offer.findById(offerId).exec();
        if ((offer.viewing.length === 1 && offer.viewing[0] === token) || offer.viewing.length === 0) {
            return true
        }

        return false;
    } catch {
        return false;
    }


}

module.exports = router;
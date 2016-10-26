import md5 from 'md5';
import cache from './../helpers/cache.js'
import Session from './../models/session.js';
import Account from './../models/account.js';

const session = {};

// get username by sessionId
session.get = (sessionID, cb) => {
    // check cache whether it has one
    if(cache.session.has(sessionID)) {
        return cb(cache.session.get(sessionID));
    }
    
    let accountId = null;
    // if not, do some mongo works
    Session.findOne({_id: sessionID}).exec()
    .then(
        (sess => {
            console.log(sess);
            // does not have session
            if(!sess) {
                cb(null);
            }

            const s = JSON.parse(sess.session);
            // not logged in
            if(!s.passport) {
                cb(null);
            }
            
            accountId = s.passport.user;

            // check whether it exists in passport cache
            if(cache.passport.has(accountId)) {
                cb(cache.passport.get(accountId));
            }

            return Account.findById(accountId).exec();
        })
    ).then(
        account => {
            cache.passport.set(accountId, account);
            cache.session.set(sessionID, account.common_profile.username);
            cb(account.common_profile.username);   
        }
    ).catch(
        (err) => {
            console.log(err);
            cb(null);
        }
    );
}

// gets anonymous username
session.getAnon = (sessionID, channel) => {
    // check cache
    // different username per channels
    if(cache.session.has(sessionID+channel)) { 
        return cache.session.get(sessionID+channel);
    }

    const hash = md5(sessionID+channel);
    cache.session.set(sessionID+channel, hash.substr(0,6));
    return hash.substr(0,6);
}



export default session;
const fetch = require('node-fetch');

const controller = {
    index: (req,res)=>{
        return res.render('index')
    }
};

module.exports = controller;
const _ = require('lodash');

function checkBeforeEntry(options){
    if(!_.isUndefined(options)) {
        if (String(options.user_agent).includes("Mozilla") || String(options.user_agent).includes("Chrome") || String(options.user_agent).includes("Dart")) {
            return true;
        }else {
            return false;
        }
    }else{
        return false;
    }
    
}

module.exports = checkBeforeEntry;
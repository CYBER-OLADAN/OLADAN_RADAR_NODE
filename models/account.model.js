const mongoose= require("mongoose")

const accountSchema= new mongoose.Schema({  
    accountNumber:{
        type: "String",
        required: true
    }
},{strict:"throw", timestamps:true})

const AccountModel = mongoose.model('Account', accountSchema);
module.exports = AccountModel;
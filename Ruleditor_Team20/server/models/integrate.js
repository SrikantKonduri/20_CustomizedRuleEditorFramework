const mongoose = require('mongoose')

let Schema = mongoose.Schema
const integrate = new Schema(
    {
        Projid: {
            type: String,
            required: true
        },
        base_encoded_string:{
            type:[String],
            required:true
        }
    },{
        collection:'Integrate'
    }
    
)

const model = mongoose.model('Integrate', integrate)

module.exports = model
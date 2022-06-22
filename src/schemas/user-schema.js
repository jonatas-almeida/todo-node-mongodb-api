const mongoose = require('mongoose')

const userSchemas = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "O nome de usuário é obrigatório"]
    },
    user_email: {
        type: String,
        required: [true, "O e-mail é obrigatório"]
    },
    user_password: {
        type: String,
        required: [true, "A senha é obrigatório"]
    }
})

module.exports = { userSchemas }
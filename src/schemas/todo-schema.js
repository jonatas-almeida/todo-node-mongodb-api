const mongoose = require("mongoose")

const todoSchemas = new mongoose.Schema({
    activity_title: {
        type: String,
        required: [true, "A atividade necessita de um título"]
    },
    activity_description: {
        type: String,
        required: [true, "A atividade necessita de uma descrição"]
    },
    user: {
        type: String,
        required: [true, "Um usuário precisa ser especificado"]
    }
});

module.exports = { todoSchemas };
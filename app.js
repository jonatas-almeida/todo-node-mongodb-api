const express = require("express");
const mongoose = require("mongoose");
const esj = require("ejs");
const bodyParser = require("body-parser");
const schema = require("./src/schemas/todo-schema");

const responseModel = require("./src/util/response-status");

const app = express()

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static("public"))

mongoose.connect("mongodb://localhost:27017/TodoDB");

// Cria a collection "activities"
const Activity = mongoose.model("Activity", schema.todoSchemas);

/** --- Endpoints gerais --- */
app.route("/todo")

    // Retorna todas as atividades
    .get(function(req, res) {
        Activity.find(function(err, result) {
            if(!err) {
                res.send({
                    data: result,
                    message: responseModel.responseStatus.success.get_response_message,
                    status: responseModel.responseStatus.success.response_status
                })
            }
            else {
                res.send({
                    data: [],
                    message: responseModel.responseStatus.failure.get_response_message,
                    status: responseModel.responseStatus.failure.response_status
                })
            }
        })
    })

    // Cria uma nova atividade
    .post(function(req, res) {
        if(req.body) {
            const newActivity = new Activity({
                activity_title: req.body.activity_title,
                activity_description: req.body.activity_description
            })
    
            // Salva no banco
            newActivity.save();
    
            res.send({
                message: responseModel.responseStatus.success.post_response_message,
                status: responseModel.responseStatus.success.response_status
            })
        }
        else{
            res.send({
                message: responseModel.responseStatus.failure.post_response_message,
                status: responseModel.responseStatus.failure.response_status
            })
        }
    })

    // Deleta todas as atividades
    .delete(function(req, res) {
        Activity.deleteMany(() => {
            res.send({
                message: responseModel.responseStatus.success.delete_all_response_message,
                status: responseModel.responseStatus.success.response_status
            })
        })
    });

/** --- Endpoints para atividades específicas --- */
app.route("/todo/:activityName")
    // Get para uma atividade específica
    .get(function(req, res) {
        Activity.findOne(
            { activity_title: req.params.activityName },
            function(err, result) {
                if(!err) {
                    res.send({
                        data: result,
                        message: responseModel.responseStatus.success.get_response_message,
                        status: responseModel.responseStatus.success.response_status
                    })
                }
                else {
                    res.send({
                        data: [],
                        message: responseModel.responseStatus.failure.get_response_message,
                        status: responseModel.responseStatus.failure.response_status
                    })
                }
            }
        )
    })

    // Atualiza uma atividade específica
    .patch(function(req, res) {
        Activity.updateOne(
            { activity_title: req.params.activityName },
            { $set: req.body },
            function(err) {
                if(!err) {
                    res.send({
                        message: responseModel.responseStatus.success.put_response_message,
                        status: responseModel.responseStatus.success.response_status
                    })
                }
                else {
                    res.send({
                        message: responseModel.responseStatus.failure.put_response_message,
                        status: responseModel.responseStatus.failure.response_status
                    })
                }
            }
        )
    })

    // Deleta uma atividade específica
    .delete(function(req, res) {
        Activity.deleteOne(
            { activity_title: req.params.activityName },
            function(err) {
                if(!err) {
                    res.send({
                        message: responseModel.responseStatus.success.delete_response_message,
                        status: responseModel.responseStatus.success.response_status
                    })
                }
                else {
                    res.send({
                        message: responseModel.responseStatus.failure.delete_response_message,
                        status: responseModel.responseStatus.failure.response_status
                    })
                }
            }
        )
    })

// Roda o servidor na porta 3080
app.listen(3080, function() {
    console.log("Server is running on port 3080");
})
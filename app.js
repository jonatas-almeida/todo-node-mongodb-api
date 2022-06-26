const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const schema = require("./src/schemas/todo-schema");
const userSchema = require("./src/schemas/user-schema")

const responseModel = require("./src/util/response-status");
const cors = require('cors')

const app = express()

const corsOpts = {
    origin: '*',

    methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE'
    ],

    allowedHeaders: [
        'Content-Type',
    ],
};

app.use(cors(corsOpts));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static("public"))
app.use(express.json())

mongoose.connect("mongodb://localhost:27017/TodoDB");

// Cria a collection "activities"
const Activity = mongoose.model("Activity", schema.todoSchemas);
const User = mongoose.model("User", userSchema.userSchemas);

/** --- Endpoints gerais --- */
app.route("/todo")

    // Retorna todas as atividades de um determinado usuário
    .post(function (req, res) {
        Activity.find({ user: req.body.user }, { user: 0 }, function (err, result) {
            if (!err) {
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

    // Deleta todas as atividades
    .delete(function (req, res) {
        Activity.deleteMany(() => {
            res.send({
                message: responseModel.responseStatus.success.delete_all_response_message,
                status: responseModel.responseStatus.success.response_status
            })
        })
    });

app.route("/todo/new_activity")// Cria uma nova atividade
    .post(function (req, res) {
        if (req.body) {
            const newActivity = new Activity({
                activity_title: req.body.activity_title,
                activity_description: req.body.activity_description,
                user: req.body.user
            })

            // Salva no banco
            newActivity.save();

            res.send({
                message: responseModel.responseStatus.success.post_response_message,
                status: responseModel.responseStatus.success.response_status
            })
        }
        else {
            res.send({
                message: responseModel.responseStatus.failure.post_response_message,
                status: responseModel.responseStatus.failure.response_status
            })
        }
    })

/** --- Endpoints para atividades específicas --- */
app.route("/todo/:activityName")
    // Get para uma atividade específica

    /** Futuramente implementar busca com filtros */
    .post(function (req, res) {
        Activity.findOne(
            { activity_title: req.params.activityName, user: req.body.user }, { user: 0 },
            function (err, result) {
                if (!err) {
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
    .patch(function (req, res) {
        Activity.updateOne(
            { _id: req.params.activityName, user: req.body.user },
            { $set: req.body },
            function (err) {
                if (!err) {
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
    .delete(function (req, res) {
        Activity.deleteOne(
            { _id: req.params.activityName },
            function (err) {
                if (!err) {
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
    });

/** End ----------- To Do Enpoints */


/** User endpoints */
app.route("/register")

    .post(function (req, res) {
        const newUser = new User({
            username: req.body.username,
            user_email: req.body.user_email,
            user_password: req.body.user_password
        })

        newUser.save(function (err) {
            if (!err) {
                res.send({
                    message: "Cadastrado com sucesso!",
                    status: responseModel.responseStatus.success.response_status
                })
            }
            else {
                res.send({
                    message: "Não foi possível cadastrar!",
                    status: responseModel.responseStatus.failure.response_status
                })
            }
        })

    });

app.route("/login")
    .post(function (req, res) {
        const username = req.body.username;
        const user_password = req.body.user_password;

        User.findOne(
            { username: username },
            function (err, result) {
                if (result && !err) {
                    if (result.username && (result.user_password === user_password)) {
                        res.send({
                            message: "Logado com sucesso!",
                            status: "success"
                        })
                    }
                    else {
                        res.send({
                            message: "Não foi possível logar!"
                        })
                    }
                }
                else {
                    res.send({
                        message: "Não foi possível logar!"
                    })
                }
            }
        )
    })

// Roda o servidor na porta 3080
app.listen(3080, function () {
    console.log("Server is running on port 3080");
})
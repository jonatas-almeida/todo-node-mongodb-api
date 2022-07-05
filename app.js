const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const schema = require("./src/schemas/todo-schema");
const userSchema = require("./src/schemas/user-schema")
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');

const responseModel = require("./src/util/response-status");
const cors = require('cors')

const app = express()

app.use(cors());

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

let userToken;

/**
 * CRIAR O ENVIO DO TOKEN DE AUTENTICAÇÃO DO USUÁRIO NO HEADER DA REQUISIÇÃO,
 * E USAR PARA CAPTURAR O TOKEN E VALIDAR AS INFORMAÇÕES DE USUÁRIO E USÁ-LAS
 */
/** --- Endpoints gerais --- */
app.route("/todo")

    // Retorna todas as atividades de um determinado usuário
    .get(function (req, res) {
        const tokenHeader = req.headers.authorization;

        if (tokenHeader) {
            userToken = tokenHeader.split(' ')[1].toString();

            const tokenVerified = jwt.verify(userToken, 'SecReT')

            try {
                if (tokenVerified) {
                    Activity.find({ user: tokenVerified.user_name }, { user: 0 }, function (err, result) {
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
                }
                else {
                    res.send({
                        error: res.statusCode,
                        message: responseModel.responseStatus.failure.response_status
                    })
                }
            } catch (error) {
                console.log(error)
            }
        }
    })

    // Deleta todas as atividades
    .delete(function (req, res) {
        const tokenHeader = req.headers.authorization;

        if (tokenHeader) {
            userToken = tokenHeader.split(' ')[1].toString()

            const tokenVerified = jwt.verify(userToken, 'SecReT')

            if (tokenVerified) {
                try {
                    Activity.deleteMany(() => {
                        res.send({
                            message: responseModel.responseStatus.success.delete_all_response_message,
                            status: responseModel.responseStatus.success.response_status
                        })
                    })
                } catch (error) {
                    console.log(error)
                }
            }
        }
    });

app.route("/todo/new_activity")// Cria uma nova atividade
    .post(function (req, res) {

        const tokenHeader = req.headers.authorization;

        if (tokenHeader) {
            try {
                userToken = tokenHeader.split(' ')[1].toString();

                const tokenVerified = jwt.verify(userToken, 'SecReT')

                if (tokenVerified) {
                    if (req.body) {
                        const newActivity = new Activity({
                            activity_title: req.body.activity_title,
                            activity_description: req.body.activity_description,
                            user: tokenVerified.user_name
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
                }
                else {
                    res.send({
                        error: res.statusCode,
                        message: responseModel.responseStatus.failure.post_response_message,
                        status: responseModel.responseStatus.failure.response_status
                    })
                }
            } catch (error) {
                res.send({
                    error: res.statusCode
                })
            }
        }
    })

/** --- Endpoints para atividades específicas --- */
app.route("/todo/:activity_name")
    // Get para uma atividade específica

    /** Futuramente implementar busca com filtros */
    .get(function (req, res) {
        const tokenHeader = req.headers.authorization;

        try {
            userToken = tokenHeader.split(' ')[1].toString();

            const tokenVerified = jwt.verify(userToken, 'SecReT')

            if (tokenVerified) {
                Activity.find(
                    { activity_title: req.params.activity_name, user: tokenVerified.user_name }, { user: 0 },
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
            }
            else {
                res.send({
                    error: res.statusCode,
                    message: 'Not allowed!'
                })
            }
        } catch (error) {
            res.send({
                error: res.statusCode,
                message: error
            })
        }
    })

    // Atualiza uma atividade específica
    .patch(function (req, res) {
        const tokenHeader = req.headers.authorization;

        if (tokenHeader) {
            userToken = tokenHeader.split(' ')[1].toString();

            const tokenVerified = jwt.verify(userToken, 'SecReT');


            if (tokenVerified) {
                try {
                    Activity.updateOne(
                        { _id: req.params.activity_name, user: tokenVerified.user_name },
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
                } catch (error) {
                    res.send({
                        error: res.statusCode,
                        message: error
                    })
                }
            }
            else {
                res.send({
                    error: res.statusCode
                })
            }
        }
    })

    // Deleta uma atividade específica
    .delete(function (req, res) {

        const tokenHeader = req.headers.authorization;

        if (tokenHeader) {
            userToken = tokenHeader.split(' ')[1].toString();

            const tokenVerified = jwt.verify(userToken, 'SecReT');

            if (tokenVerified) {
                try {
                    Activity.deleteOne(
                        { _id: req.params.activity_name },
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
                } catch (error) {
                    res.send({
                        error: res.statusCode,
                        message: error
                    })
                }
            }
            else {
                res.send({
                    error: res.statusCode
                })
            }
        }
        else {
            res.send({
                message: 'Not allowed!' + res.statusCode
            })
        }
    });

/** End ----------- To Do Enpoints */


// Search for an existing username
app.get('/todo/search_username/:username', function (req, res) {

    const userName = req.params.username;

    if (userName) {
        User.find({ username: userName }, function (err, result) {
            if (err) {
                res.send({
                    error: "É necessário um nome de usuário para a verificação"
                })
            }
            else {
                if (result.length > 0) {
                    res.send({
                        message: "Nome de usuário já existe!",
                        available: false
                    })
                }
                else {
                    res.send({
                        message: "Nome de usuário disponível!",
                        available: true
                    })
                }
            }
        })
    }

})

/** User endpoints */
app.route("/register")

    .post(function (req, res) {
        const newUser = new User({
            username: req.body.username,
            user_email: req.body.user_email,
            user_full_name: req.body.user_full_name,
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
    .post(function (req, response) {

        const username = req.body.username;
        const user_password = req.body.user_password;

        try {
            User.findOne(
                { username: username },
                function (err, result) {
                    if (result && !err) {
                        bcrypt.compare(user_password, result.user_password, function (err, res) {
                            if ((result.username === req.body.username) && res) {

                                const tokenInfo = { id: result.id, user_name: result.username, user_full_name: result.user_full_name }
                                // Generates token
                                const token = jwt.sign(tokenInfo, "SecReT");

                                // Populates token when logged in
                                userToken = token;

                                response.send({
                                    token: token,
                                    message: "Logado com sucesso!",
                                    status: "success"
                                })
                            }
                            else {
                                response.send({
                                    message: "Não foi possível logar!"
                                })
                            }
                        })
                    }
                    else {
                        response.send({
                            message: "Não foi possível fazer o login",
                            status: "failed"
                        })
                    }
                }
            )
        } catch (error) {
            console.log(error)
        }
    })

// Roda o servidor na porta 3080
app.listen(3080, function () {
    console.log("Server is running on port 3080");
})
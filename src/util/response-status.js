const responseStatus = {
    success: {
        get_response_message: "Dados retornados com sucesso!",
        post_response_message: "Atividade cadastrada com sucesso!",
        put_response_message: "Atividade atualizada com sucesso!",
        delete_response_message: "Atividade deletada com sucesso!",
        delete_all_response_message: "Todas as atividades foram deletadas com sucesso!",
        response_status: "success"
    },
    failure: {
        get_response_message: "Não foi possível retornar as atividades!",
        post_response_message: "Não foi possível cadastrar a atividade!",
        put_response_message: "Não foi possível atualizar a atividade",
        delete_response_message: "Não foi possível deletar a atividade!",
        delete_all_response_message: "Não foi possível deletar as atividades",
        response_status: "failed"
    }
}

module.exports = { responseStatus }
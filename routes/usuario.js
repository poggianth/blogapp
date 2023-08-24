import express from 'express';
const usuario = express.Router();
import mongoose from 'mongoose';
import Usuario from '../models/Usuario.js';
import bcryptjs from 'bcryptjs';


usuario.get("/registro", (req, res) => {
    res.render("usuario/registro");
});

usuario.post("/registro", (req, res) => {
    let erros = verificaCamposCadastro(req.body.nome, req.body.email, req.body.senha, req.body.senha2);

    if(erros.length > 0){
        res.render("../views/usuario/registro", {erros: erros});
    }else{

        Usuario.findOne({email: req.body.email}).lean().then((userExist) => {
            if(userExist){
                console.log(`Usuário já existe!`);
                req.flash("error_msg", "E-mail já registrado!");
                res.redirect("/usuario/registro");
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                });

                bcryptjs.genSalt(10, (erro, salt) => {
                    bcryptjs.hash(novoUsuario.senha, salt, (error, hash) => {
                        if(error){
                            console.log(`Erro ao salvar usuário: ${error}`);
                            req.flash("error_msg", "Erro ao cadastrar usuário");
                            res.redirect("/");
                        }
                        console.log(`Hash: ${hash}`);
                        novoUsuario.senha = hash;

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário cadastrado com sucesso!");
                            res.redirect("/");
                        }).catch((err) => {
                            console.log(`Erro ao salvar usuário: ${err}`);
                            req.flash("error_msg", "Erro ao salvar usuário, tente novamente!");
                            res.redirect("/usuario/registro");
                        });
                    });
                });
            }
        }).catch((err) => {
            console.log(`Erro ao listar o e-mail do usuário: ${err}`);
            req.flash("error_msg", "Houve um erro interno!");
            res.redirect("/");
        });
    }
});

function verificaCamposCadastro (nome, email, senha, senha2){
    var erros = [];

    if(!nome || typeof nome === undefined || nome == null){
        erros.push({texto: "Nome inválido!"});
    };

    if(!email || typeof email === undefined || email == null){
        erros.push({texto: "E-mail inválido!"});
    };

    if(!senha || typeof senha === undefined || senha == null){
        erros.push({texto: "Senha inválida!"});
    };

    if(senha.length < 4){
        erros.push({texto: "Senha muito curta!"});
    };

    if(senha != senha2){
        erros.push({texto: "As senhas não conferem!"})
    };

    return erros;
}


export {usuario};
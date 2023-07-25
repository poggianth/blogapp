import express from 'express';
const admin = express.Router();
import Categoria from '../models/Categoria.js';
import Postagem from '../models/Postagem.js';
// const Categoria = mongoose.model("categorias")

admin.get('/', (req, res) => {
    res.render("admin/index");
});

admin.get("/posts", (req, res) => {
    res.send(`Página de posts`);
});

admin.get("/categorias", (req, res) => {
    // Listando categorias
    Categoria.find().lean().sort({date: 'desc'}).then((categorias) => {
        res.render("./admin/categorias", {categorias, categorias});
    }).catch((err) => {
        console.log(`[OPS] - Erro ao listar as categorias: ${err}`);
        req.flash("errror_msg", "[OPS] - Erro ao listar as categorias");
        res.redirect("/admin");
    })
});

admin.get("/categorias/add", (req, res) => {
    res.render("./admin/addcategorias");
});

admin.post("/categorias/nova", (req, res) => {
     
    var erros = verificaCamposCategoria(req.body.nome, req.body.slug);
    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros});
    } else{
        console.log("nome: " + req.body.nome);
        console.log("slug: " + req.body.slug);
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        };
    
        new Categoria(novaCategoria).save().then(() => {
            // Passa o valor de sucesso para a variavel
            req.flash("success_msg", "Categoria cadastrada com sucesso!")
            res.redirect(`/admin/categorias`);
        }).catch((err) => {
            console.log(`Erro ao cadastrar categoria: ${err}`);
            req.flash("error_msg", "[OPS] Erro ao editar categoria, tente novamente!");
            res.redirect("/admin/categorias");
        });
    }
});

admin.get("/categorias/edit/:id", (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render(`admin/editcategorias`, {categoria: categoria});
    }).catch((err) => {
        console.log(`Erro ao listar categoria: ${err}`);
        req.flash("error_msg", "Esta categoria não existe");
        res.redirect("/admin/categorias");
    })
});

admin.post("/categorias/edit", (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;
            
            // !!!!! Ao alterar => Para utilizar o .save(), tem que tirar o lean() depois do find(); !!!!!
            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!");
                res.redirect("/admin/categorias");
            }).catch((err) => {
                console.log(`Erro ao alterar a categoria: ${err}`);
                req.flash("error_msg", "[OPS] - Erro ao alterar a categoria!");
            });
        // }

    }).catch((err) => {
        console.log(`Erro ao buscar a categoria: ${err}`);
        req.flash("error_msg", "[OPS] - Erro ao buscar a categoria");
        res.redirect("/admin/categorias");
    })
});

admin.post("/categorias/deletar", (req, res) => {
    console.log((`Valor no admin: ${req.body.id}`));
    
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!");
        res.redirect("/admin/categorias");
    }).catch((err) => {
        console.log(`Erro ao deletar a categoria!: ${err}`);
        req.flash("error_msg", "Erro ao deletar a categoria!");
        res.redirect("/admin/categorias");
    })
});

admin.get("/postagens", (req, res) => {
    Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens});
    }).catch((err) => {
        console.log(`[OPS] - Erro ao listar as postagens: ${err}`);
        req.flash("error_msg", "[OPS] - Erro ao listar as postagens");
        res.redirect("/admin");
    });
});

admin.get("/postagens/add", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias});
    }).catch((err) => {
        console.log(`[OPS] - Erro ao carregar o formulário: ${err}`);
        req.flash("error_msg", "[OPS] - Erro ao carregar o formulário!");
        res.redirect("/admin");
    });
});

admin.post("/postagens/nova", (req, res) => {
    var erros = [];

    if(req.body.categoria == "0"){
        erros.push({texto: "Categória inválida, registre uma categoria."});
    }

    if(erros.length > 0){
        res.render("admin/addpostagem", {erros: erros});
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            data: Date.now()
        };

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso.");
            res.redirect("/admin/postagens");
        }).catch((err) => {
            req.flash("error_msg", "[OPS] - Erro ao salvar postagem.");
            res.redirect("/admim/postagens");
        })
    }
});


// Funções estaticas
function verificaCamposCategoria(nome, slug){
    let erros = [];

    if(!nome || typeof nome == undefined || nome == null){
        erros.push({texto: "Nome inválido"});
    }

    if(nome.length < 2){
        erros.push({texto: "Nome da categoria é muito pequeno"});
    }

    if(!slug || typeof slug == undefined || slug == null){
        erros.push({texto: "Slug inválido"});
    }

    return erros;
}

export {admin as admin};
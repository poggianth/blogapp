// Importando módulos
import express from 'express';
import { engine as handlebars } from 'express-handlebars';
import bodyParser from "body-parser";
const app = express();
const PORT = 8081;
import mongoose from "mongoose";
import session from 'express-session';
import flash from 'connect-flash';
import Postagem from './models/Postagem.js';
import Categoria from './models/Categoria.js';
import { admin } from './routes/admin.js';
import { usuario } from './routes/usuario.js';

// Para utilizar o __dirname
    import path from 'path';
    import { fileURLToPath } from 'url';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

// Configurações
    // Sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }));
        // Flash some depois de um tempo
        app.use(flash());
    // Middleware - todos que tiverem app.use() é um Middleware
        app.use((req, res, next) =>{
            // Criando variaveis globais
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash("error_msg");
            next();
        });
    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');
    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://127.0.0.1/blogapp").then(() => {
            console.log("Conectado ao mongo!");
        }).catch((error) => {
            console.log(`Erro ao conectar ao mongo: ${error}`);
        })
    // Public
        app.use(express.static(path.join(__dirname, "public")));

    // Middleware

// Rotas
    app.get('/', (req, res) => {
        Postagem.find().lean().populate("categoria").sort({date: "desc"}).then((postagens) => {
            res.render("admin/index", {postagens: postagens});
        }).catch((err) => {
            console.log(`Erro ao listar postagens: ${err}`);
            req.flash("error_msg", "Houve um erro intero");
            res.redirect("/404");
        })
    });

    app.get("/postagem/:slug", (req, res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem){
                res.render("postagem/index", {postagem: postagem});
            }else{
                req.flash("error_msg", "Essa postagem não existe!");
                res.redirect("/");
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno!")
            res.redirect("/");
        });
    });

    app.post("/404", (req, res) => {
        res.send("Erro 404!");
    });

    app.get("/categorias", (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias: categorias});
        }).catch((err) => {
            console.log(`Erro interno ao listar as categorias: ${err}`);
            req.flash("error_msg", "Erro interno ao listar as categorias!");
            res.redirect("/");
        })
    });

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id});

            }else{
                console.log(`Esta categoria não existe!`);
                req.flash("error_msg", "Esta categoria não existe!");
            }
        }).catch((err) => {
            console.log(`Erro ao listar categoria: ${err}`);
            req.flash("error_msg", "Erro ao listar categoria!");
            res.redirect("/"); 
        });
    });

    app.use('/admin', admin);
    app.use('/usuario', usuario);

// Outros
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Usuario = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Number,
        default: 0
    },
    senha: {
        type: String,
        required: true
    }
});

export default (mongoose.model("usuarios", Usuario));

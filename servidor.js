require('dotenv').config();

const express = require ('express');
const cors = require('cors');
const sequelize = require('./modelos/banco');
const usuario = require ('./rotas/usuariosRotas');
const dica = require ('./rotas/dicaRotas');
const faq = require ('./rotas/faqRotas');
const medicamento = require ('./rotas/medicamentoRotas');
const ministra = require ('./rotas/ministraRotas');
const interacao = require ('./rotas/interacaoRotas');
const app = express()
const porta = process.env.PORTA_API;

const meuLogger = (req, res, next) => {
    const metodo = req.method;
    const url = req.url;
    const data = new Date().toISOString();
    console.log(`[${data}] - Nova requisição: ${metodo} ${url}`);
    next();
}

app.use(cors());
app.use(express.json())
app.use(meuLogger)
app.use('/usuario', usuario);
app.use('/dica', dica);
app.use('/faq', faq);
app.use('/medicamento', medicamento);
app.use('/ministra', ministra);
app.use('/interacao', interacao);

app.get('/', (req, res) => {
    res.send('<h1>API Fale com a Dinda no ar!</h1>');
})

const tratadorDeErros = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'SequelizeValidationError') {
        const mensagemErro = err.errors.map(e => e.message).join(', ');
        return res.status(400).json({ erro: mensagemErro });
    }
    res.status(500).json({ erro: 'Ocorreu um erro inesperado no servidor.' });
};
app.use(tratadorDeErros);


sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso.')
        app.listen(porta, () => {
            console.log(`🚀 Servidor Express a funcionar em http://localhost:${porta}`)
        });
    })
    .catch(err => {
        console.error('❌ Não foi possível conectar ao banco de dados:', err)
    });
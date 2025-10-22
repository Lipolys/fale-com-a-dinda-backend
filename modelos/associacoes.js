// Importa todos os seus modelos
const Usuario = require('./usuario');
const Cliente = require('./cliente');
const Farmaceutico = require('./farmaceutico');
const Dica = require('./dica'); // Corrigido para singular
const Medicamento = require('./medicamento');
const Ministra = require('./ministra');
const Faq = require('./faq');
const Interacao = require('./interacao');

// Relação 1:1 - Usuario <-> Cliente
Usuario.hasOne(Cliente, { foreignKey: 'usuario_idusuario', as: 'cliente' });
Cliente.belongsTo(Usuario, { foreignKey: 'usuario_idusuario', as: 'usuario' });

// Relação 1:1 - Usuario <-> Farmaceutico
Usuario.hasOne(Farmaceutico, { foreignKey: 'usuario_idusuario', as: 'farmaceutico' });
Farmaceutico.belongsTo(Usuario, { foreignKey: 'usuario_idusuario', as: 'usuario' });

// --- Relações do Farmacêutico (1:N) ---

// Relação 1:N - Farmaceutico -> Dica
Farmaceutico.hasMany(Dica, { foreignKey: 'farmaceutico_idfarmaceutico', as: 'dicas' });
Dica.belongsTo(Farmaceutico, { foreignKey: 'farmaceutico_idfarmaceutico', as: 'farmaceutico' });

// Relação 1:N - Farmaceutico -> Medicamento
Farmaceutico.hasMany(Medicamento, { foreignKey: 'farmaceutico_idfarmaceutico', as: 'medicamentos' });
Medicamento.belongsTo(Farmaceutico, { foreignKey: 'farmaceutico_idfarmaceutico', as: 'farmaceutico' });

// Relação 1:N - Farmaceutico -> Faq (NOVO)
Farmaceutico.hasMany(Faq, { foreignKey: 'farmaceutico_idfarmaceutico', as: 'faqs' });
Faq.belongsTo(Farmaceutico, { foreignKey: 'farmaceutico_idfarmaceutico', as: 'farmaceutico' });

// Relação 1:N - Farmaceutico -> Interacao (NOVO)
// Um farmacêutico pode registrar várias interações
Farmaceutico.hasMany(Interacao, { foreignKey: 'farmaceutico_idfarmaceutico', as: 'interacoesRegistradas' });
Interacao.belongsTo(Farmaceutico, { foreignKey: 'farmaceutico_idfarmaceutico', as: 'farmaceutico' });


// --- Relações N:M (Muitos-para-Muitos) ---

// Relação N:M - Cliente <-> Medicamento (via 'ministra')
Cliente.belongsToMany(Medicamento, {
    through: Ministra,
    foreignKey: 'cliente_idcliente', // Chave em 'ministra' que aponta para Cliente
    otherKey: 'medicamento_idmedicamento', // Chave em 'ministra' que aponta para Medicamento
    as: 'medicamentos'
});
Medicamento.belongsToMany(Cliente, {
    through: Ministra,
    foreignKey: 'medicamento_idmedicamento',
    otherKey: 'cliente_idcliente',
    as: 'clientes'
});

// Relação N:M - Medicamento <-> Medicamento (via 'interacao') (NOVO)
// Define a interação de um medicamento com outros
Medicamento.belongsToMany(Medicamento, {
    through: Interacao,
    foreignKey: 'idmedicamento1', // Chave que aponta para "este" medicamento
    otherKey: 'idmedicamento2', // Chave que aponta para o "outro" medicamento
    as: 'interageCom' // Ex: medicamento.getInterageCom()
});
// É uma boa prática definir a relação inversa também
Medicamento.belongsToMany(Medicamento, {
    through: Interacao,
    foreignKey: 'idmedicamento2',
    otherKey: 'idmedicamento1',
    as: 'interacoesSofridas' // Ex: medicamento.getInteracoesSofridas()
});


// Exporta todos os modelos associados
module.exports = {
    Usuario,
    Cliente,
    Farmaceutico,
    Dica,
    Medicamento,
    Ministra,
    Faq,
    Interacao,
    sequelize: require('./banco') // Exporta a instância do sequelize também
};
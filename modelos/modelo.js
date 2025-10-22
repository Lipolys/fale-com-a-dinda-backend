// Exemplo de como definir associações
const Usuario = require('usuario');
const Cliente = require('cliente');
const Farmaceutico = require('farmaceutico');
const Dica = require('dica');
const Medicamento = require('medicamento');
const Ministra = require('ministra');

// Relação 1:1 - Usuario ↔ Cliente
Usuario.hasOne(Cliente, { foreignKey: 'usuario_idusuario', as: 'cliente' });
Cliente.belongsTo(Usuario, { foreignKey: 'usuario_idusuario', as: 'usuario' });

// Relação 1:1 - Usuario ↔ Farmaceutico
Usuario.hasOne(Farmaceutico, { foreignKey: 'usuario_idusuario', as: 'farmaceutico' });
Farmaceutico.belongsTo(Usuario, { foreignKey: 'usuario_idusuario', as: 'usuario' });

// Relação 1:N - Farmaceutico -> Dicas
Farmaceutico.hasMany(Dicas, { foreignKey: 'farmaceutico_idfarmaceutico', as: 'dicas' });
Dica.belongsTo(Farmaceutico, { foreignKey: 'farmaceutico_idfarmaceutico', as: 'farmaceutico' });

// Relação 1:N - Farmaceutico -> Medicamento
Farmaceutico.hasMany(Medicamento, { foreignKey: 'farmaceutico_idfarmaceutico', as: 'medicamentos' });
Medicamento.belongsTo(Farmaceutico, { foreignKey: 'farmaceutico_idfarmaceutico', as: 'farmaceutico' });

// Relação N:M - Cliente ↔ Medicamento (via 'ministra')
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

// (E assim por diante para FAQ e Interacao)


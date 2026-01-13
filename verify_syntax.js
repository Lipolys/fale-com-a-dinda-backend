try {
    require('./modelos/notificacao');
    require('./modelos/associacoes');
    require('./controladores/notificacaoControlador');
    require('./rotas/notificacaoRotas');
    console.log('✅ All new modules loaded successfully. Syntax check passed.');
    process.exit(0);
} catch (error) {
    console.error('❌ Syntax error or module loading failure:', error);
    process.exit(1);
}

const TokenServico = require('../servicos/tokenServico');

/**
 * Job para limpar tokens expirados do banco de dados
 * Deve ser executado periodicamente (ex: diariamente via cron)
 */
class LimpezaTokensJob {

    /**
     * Executa a limpeza de tokens expirados
     */
    static async executar() {
        console.log(`[${new Date().toISOString()}] Iniciando limpeza de tokens expirados...`);

        try {
            const quantidadeRemovida = await TokenServico.limparTokensExpirados();

            console.log(`[${new Date().toISOString()}] Limpeza concluída. ${quantidadeRemovida} tokens removidos.`);

            return {
                sucesso: true,
                quantidadeRemovida
            };

        } catch (error) {
            console.error(`[${new Date().toISOString()}] Erro na limpeza de tokens:`, error);

            return {
                sucesso: false,
                erro: error.message
            };
        }
    }

    /**
     * Agenda execução periódica (a cada 24 horas)
     */
    static agendar() {
        const INTERVALO_24H = 24 * 60 * 60 * 1000; // 24 horas em milissegundos

        console.log(`[${new Date().toISOString()}] Job de limpeza de tokens agendado (a cada 24h)`);

        // Executa imediatamente
        this.executar();

        // Agenda execuções futuras
        setInterval(() => {
            this.executar();
        }, INTERVALO_24H);
    }

    /**
     * Execução única (para testes ou cronjobs externos)
     */
    static async executarUmaVez() {
        const resultado = await this.executar();
        process.exit(resultado.sucesso ? 0 : 1);
    }
}

// Se executado diretamente (não importado)
if (require.main === module) {
    // Carrega variáveis de ambiente
    require('dotenv').config();

    // Executa uma vez e sai
    LimpezaTokensJob.executarUmaVez();
}

module.exports = LimpezaTokensJob;
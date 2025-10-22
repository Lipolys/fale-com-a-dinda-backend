const curso = {
    nome: 'Node.js',
    alunos: ['Ana', 'Beto', 'Carla'],

    anunciarAlunos: function() {
        console.log('Bem-vindos ao curso de ' + this.nome); // 'this' aqui é o 'curso'

        // Queremos iterar sobre this.alunos
        this.alunos.forEach(function() {
            // O que 'this.nome' seria aqui dentro?
            console.log('Temos o aluno: ' + this.nome);
        });
    }
};

curso.anunciarAlunos();
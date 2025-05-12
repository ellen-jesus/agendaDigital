import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'agenda_digital';
  nome = '';
  data: Date | null = null;
  horaSelecionada = '';
  procedimentoSelecionado = '';
  numeroWhatsApp = '5511999999999'; // Substitua pelo seu número

  procedimentos = ['Escova', 'Maquiagem', 'Penteado', 'Corte', 'Química'];
  valores: { [key: string]: number } = {
    'Escova': 30,
    'Maquiagem': 80,
    'Penteado': 100,
    'Corte': 40,
    'Química': 150,
  };
  horariosDisponiveis: string[] = [];

  constructor(private firestore: AngularFirestore) {
    this.atualizarHorarios('Escova');
  }

  atualizarHorarios(procedimento: string) {
    let intervaloMinutos = 30;

    if (procedimento === 'Maquiagem' || procedimento === 'Penteado' || procedimento === 'Química') {
      intervaloMinutos = 60;
    }

    this.horariosDisponiveis = this.gerarHorarios(8, 18, intervaloMinutos);
    this.horaSelecionada = '';
  }

  gerarHorarios(horaInicio: number, horaFim: number, intervalo: number): string[] {
    const horarios: string[] = [];
    let hora = horaInicio;
    let minuto = 0;

    while (hora < horaFim || (hora === horaFim && minuto === 0)) {
      const hStr = hora.toString().padStart(2, '0');
      const mStr = minuto.toString().padStart(2, '0');
      horarios.push(`${hStr}:${mStr}`);

      minuto += intervalo;
      if (minuto >= 60) {
        minuto = minuto % 60;
        hora++;
      }
    }

    return horarios;
  }

  get valorSelecionado(): number | null {
    return this.procedimentoSelecionado ? this.valores[this.procedimentoSelecionado] : null;
  }

  get linkWhatsApp(): string | null {
    if (!this.nome || !this.data || !this.horaSelecionada || !this.procedimentoSelecionado) return null;

    const dataFormatada = this.data.toLocaleDateString('pt-BR');
    const valor = this.valorSelecionado ? `Valor: R$ ${this.valorSelecionado}` : '';
    const mensagem = `Olá, me chamo ${this.nome}. Gostaria de agendar um(a) ${this.procedimentoSelecionado} para ${dataFormatada} às ${this.horaSelecionada}. ${valor}`;
    const mensagemCodificada = encodeURIComponent(mensagem);
    return `https://wa.me/${this.numeroWhatsApp}?text=${mensagemCodificada}`;
  }

  // Função para salvar agendamento no Firebase Firestore
  salvarAgendamento() {
    if (!this.nome || !this.data || !this.procedimentoSelecionado || !this.horaSelecionada) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const agendamento = {
      nome: this.nome,
      data: this.data,
      procedimento: this.procedimentoSelecionado,
      horario: this.horaSelecionada,
      valor: this.valorSelecionado,
      criadoEm: new Date()
    };

    this.firestore.collection('agendamentos').add(agendamento)
      .then(() => {
        alert('Agendamento salvo com sucesso!');
      })
      .catch((error) => {
        console.error('Erro ao salvar agendamento:', error);
        alert('Erro ao salvar agendamento. Tente novamente.');
      });
  }
}

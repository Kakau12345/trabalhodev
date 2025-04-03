import React, { useState } from 'react'; 
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native'; 

export default function App() {
  // Estado inicial
  const [tela, setTela] = useState('introducao'); // Tela atual (introdução ou jogo)
  const [buttonStates, setButtonStates] = useState(Array(9).fill('#6a1b9a')); // Cores dos botões (9 botões)
  const [sequence, setSequence] = useState([]); // Sequência que o computador gera
  const [playerSequence, setPlayerSequence] = useState([]); // Sequência que o jogador tenta lembrar
  const [isButtonFlashing, setIsButtonFlashing] = useState(false); // Indica se os botões estão piscando
  const [score, setScore] = useState(0); // Pontuação do jogador
  const [level, setLevel] = useState(1); // Nível inicial do jogo

  // Função que exibe a nova tela (início do jogo)
  const showNewScreen = () => {
    setTela('novaTela');
    startButtonFlashing(); // Inicia o jogo
  };

  // Função para voltar para a tela de introdução
  const goBackToIntro = () => {
    setTela('introducao');
    setButtonStates(Array(9).fill('#6a1b9a')); // Reseta os botões
    setSequence([]); // Reseta a sequência
    setPlayerSequence([]); // Reseta a sequência do jogador
    setScore(0); // Reseta a pontuação
    setLevel(1); // Reseta o nível
  };

  // Função que determina o comprimento da sequência com base no nível do jogo
  const getLevelSequenceLength = () => {
    return level + 4; // Inicia com 5 botões no nível 1, e aumenta 1 a cada nível
  };

  // Função para gerar uma nova sequência de números aleatórios
  const generateSequence = () => {
    const sequenceLength = getLevelSequenceLength(); // Obtém o comprimento da sequência com base no nível
    const newSequence = [];
    for (let i = 0; i < sequenceLength; i++) {
      newSequence.push(Math.floor(Math.random() * 9)); // Gera um número aleatório entre 0 e 8
    }
    setSequence(newSequence); // Atualiza a sequência no estado
    return newSequence;
  };

  // Função que faz os botões piscarem, indicando a sequência
  const startButtonFlashing = () => {
    const newSequence = generateSequence(); // Gera uma nova sequência
    setIsButtonFlashing(true); // Inicia o modo de piscar
    setPlayerSequence([]); // Reseta a sequência do jogador
    
    let index = 0;
    
    // A cada nível, diminui o tempo entre as piscadas e aumenta a quantidade de piscadas
    const flashingSpeed = 1000 - (level - 1) * 200; // Reduz 200ms a cada nível
    const flashCount = newSequence.length + (level - 1); // Aumenta a quantidade de piscadas conforme o nível
    const flashInterval = setInterval(() => {
      if (index < flashCount) {
        const buttonIndex = newSequence[index % newSequence.length]; // Seleciona aleatoriamente um botão da sequência
        highlightButton(buttonIndex, '#ffffff'); // Destaca o botão
        setTimeout(() => {
          highlightButton(buttonIndex, '#6a1b9a'); // Volta ao padrão
        }, flashingSpeed / 2); // Meio do tempo de piscada para apagar a luz

        index++; // Passa para o próximo botão
      } else {
        clearInterval(flashInterval); // Para o intervalo quando a sequência terminar
        setIsButtonFlashing(false); // Finaliza o modo de piscar
      }
    }, flashingSpeed); // Intervalo ajustável baseado no nível
  };

  // Função que altera a cor de um botão
  const highlightButton = (index, color) => {
    const newStates = [...buttonStates]; // Copia o estado atual
    newStates[index] = color; // Altera a cor do botão
    setButtonStates(newStates); // Atualiza o estado com a nova cor
  };

  // Função que lida com o pressionamento de um botão pelo jogador
  const handleButtonPress = (index) => {
    if (!isButtonFlashing && playerSequence.length < sequence.length) { // Se não estiver piscando e o jogador ainda não completou a sequência
      // Feedback visual do toque (roxo mais claro)
      highlightButton(index, '#9c27b0');
      setTimeout(() => highlightButton(index, '#6a1b9a'), 300); // Volta ao padrão após 300ms

      const newPlayerSequence = [...playerSequence, index]; // Adiciona o índice do botão pressionado à sequência do jogador
      setPlayerSequence(newPlayerSequence);

      if (newPlayerSequence[newPlayerSequence.length - 1] === sequence[newPlayerSequence.length - 1]) { // Se o último botão pressionado for o correto
        if (newPlayerSequence.length === sequence.length) { // Se a sequência estiver completa
          const newScore = score + 100; // Incrementa a pontuação em 100
          setScore(newScore);

          // Aumenta o nível a cada 500 pontos
          if (newScore >= 100 && newScore < 1000) {
            setLevel(2); // Nível 2
          } else if (newScore >= 200) {
            setLevel(3); // Nível 3
          }

          setTimeout(() => {
            Alert.alert(
              'Parabéns!', 
              `Você acertou a sequência!\nPontuação: ${newScore}\nNível: ${level}`,
              [
                { 
                  text: 'Próxima rodada', 
                  onPress: startButtonFlashing // Começa uma nova rodada
                }
              ]
            );
            setPlayerSequence([]); // Reseta a sequência do jogador
          }, 500);
        }
      } else { // Se o jogador errar
        // Feedback de erro (vermelho)
        highlightButton(index, '#f44336');
        setTimeout(() => {
          Alert.alert(
            'Ops!', 
            `Sequência incorreta.\nSua pontuação final: ${score}`,
            [
              { 
                text: 'Tentar novamente', 
                onPress: () => {
                  setPlayerSequence([]); // Reseta a sequência do jogador
                  setButtonStates(Array(9).fill('#6a1b9a')); // Reseta os botões
                  setScore(0); // Reseta a pontuação
                  setLevel(1); // Reseta o nível
                  startButtonFlashing(); // Inicia uma nova rodada
                } 
              }
            ]
          );
        }, 500);
      }
    }
  };

  // Tela de introdução
  if (tela === 'introducao') {
    return (
      <View style={styles.container}>
        <Text style={styles.titleint}>Bem-vindo ao Desafio Genius!</Text>
        <Text style={styles.subtitle}>Teste sua memória</Text>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={showNewScreen} // Começa o jogo
        >
          <Text style={styles.startButtonText}>COMEÇAR JOGO</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Tela do jogo
  if (tela === 'novaTela') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.scoreText}>Pontuação: {score}</Text>
          <Text style={styles.scoreText}>Nível: {level}</Text>
        </View>

        <Text style={styles.title}>Genius</Text>
        <Text style={styles.subtitle}>Memorize a sequência de luzes</Text>

        <View style={styles.buttonGrid}>
          <View style={styles.buttonRow}>
            {[0, 1, 2].map((index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.button, { 
                  backgroundColor: buttonStates[index],
                  shadowColor: buttonStates[index] === '#ffffff' ? '#fff' : '#000',
                }]}

                onPress={() => handleButtonPress(index)} // Lida com o pressionamento do botão
                disabled={isButtonFlashing} // Desabilita os botões durante a sequência piscando
              />
            ))}
          </View>
          <View style={styles.buttonRow}>
            {[3, 4, 5].map((index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.button, { 
                  backgroundColor: buttonStates[index],
                  shadowColor: buttonStates[index] === '#ffffff' ? '#fff' : '#000',
                }]}

                onPress={() => handleButtonPress(index)} // Lida com o pressionamento do botão
                disabled={isButtonFlashing} // Desabilita os botões durante a sequência piscando
              />
            ))}
          </View>
          <View style={styles.buttonRow}>
            {[6, 7, 8].map((index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.button, { 
                  backgroundColor: buttonStates[index],
                  shadowColor: buttonStates[index] === '#ffffff' ? '#fff' : '#000',
                }]}

                onPress={() => handleButtonPress(index)} // Lida com o pressionamento do botão
                disabled={isButtonFlashing} // Desabilita os botões durante a sequência piscando
              />
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={startButtonFlashing} // Inicia uma nova rodada
          >
            <Text style={styles.actionButtonText}>NOVA RODADA</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#333' }] }
            onPress={goBackToIntro} // Volta para a tela de introdução
          >
            <Text style={styles.actionButtonText}>VOLTAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null; 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#e0e0e0',
    textAlign: 'center',
  },
  titleint: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#bb86fc',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#a0a0a0',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bb86fc',
  },
  buttonGrid: {
    marginVertical: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginHorizontal: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  startButton: {
    backgroundColor: '#6a1b9a',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 30,
    shadowColor: '#bb86fc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  actionButton: {
    backgroundColor: '#6a1b9a',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginVertical: 10,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#bb86fc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
});
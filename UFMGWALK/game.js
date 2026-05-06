// UFMGWALK - Game Engine (Phaser 3)

const MAP_WIDTH = 2000;
const MAP_HEIGHT = 1500;

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Para o futuro: carregar tilesets e sprites reais.
    }

    create() {
        // 1. Fundo do Mapa (Grama do Campus)
        this.add.rectangle(0, 0, MAP_WIDTH, MAP_HEIGHT, 0x5a8f4c).setOrigin(0, 0);
        
        // 2. Limites físicos do mundo
        this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

        // Grades para dar sensação de "piso" (Opcional, ajuda a ver o movimento)
        this.add.grid(MAP_WIDTH/2, MAP_HEIGHT/2, MAP_WIDTH, MAP_HEIGHT, 50, 50, 0x000000, 0, 0xffffff, 0.1);

        // 3. Desenhando os Prédios (Mockup do Campus)
        this.createBuilding(400, 300, 300, 200, 0x999999, "ICEx");
        this.createBuilding(900, 400, 250, 150, 0xe0ca3c, "FAFICH");
        this.createBuilding(600, 800, 400, 300, 0x8a1c1c, "Praça de Serviços");
        this.createBuilding(1300, 700, 300, 400, 0x3b6978, "FACE");
        this.createBuilding(100, 900, 200, 200, 0x9e8979, "CAD 1");
        this.createBuilding(1000, 100, 350, 180, 0xaaaaaa, "Reitoria");
        
        // Lagoa da Pampulha (Contexto visual)
        const lake = this.add.ellipse(MAP_WIDTH - 200, MAP_HEIGHT - 200, 600, 400, 0x3498db, 0.7);
        this.add.text(MAP_WIDTH - 300, MAP_HEIGHT - 200, 'Lagoa da Pampulha', { fontSize: '24px', fill: '#000', fontStyle: 'bold' });
        
        // 4. Criando o Jogador
        this.player = this.add.container(MAP_WIDTH / 2, MAP_HEIGHT / 2 + 200);
        
        // Corpo do Avatar
        const charBody = this.add.circle(0, 0, 20, 0xf1c40f);
        charBody.setStrokeStyle(3, 0x000000);
        this.player.add(charBody);
        
        // Tag de Nome
        const nameTag = this.add.text(0, -35, 'Você', {
            fontSize: '14px',
            fontFamily: 'Inter',
            fontWeight: 'bold',
            fill: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5);
        this.player.add(nameTag);

        // Balão de Chat (Escondido por padrão)
        this.chatBalloon = this.add.text(0, -70, '', {
            fontSize: '14px',
            fontFamily: 'Inter',
            fontWeight: 'bold',
            fill: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setVisible(false);
        // Bordinha do balão css-like
        this.chatBalloon.setStroke('#cccccc', 2);
        this.player.add(this.chatBalloon);

        // Física do Jogador
        this.physics.world.enable(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setSize(40, 40);

        // 5. Configuração da Câmera
        this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08); // Suavidade na câmera
        this.cameras.main.setZoom(1.2);

        // 6. Controles
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        // Configurar a interface web do Bate-papo
        this.setupChatUI();
    }

    createBuilding(x, y, width, height, color, name) {
        // Base do prédio
        const b = this.add.rectangle(x, y, width, height, color).setOrigin(0, 0);
        b.setStrokeStyle(6, 0x333333);
        
        // Sombra / Profundidade simples
        this.add.rectangle(x + 10, y + height, width, 10, 0x000000, 0.3).setOrigin(0,0);
        this.add.rectangle(x + width, y + 10, 10, height - 10, 0x000000, 0.3).setOrigin(0,0);

        // Texto com o nome do prédio
        this.add.text(x + width/2, y + height/2, name, {
            fontSize: '28px',
            fontFamily: 'Inter',
            fontWeight: 'bold',
            fill: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
    }

    update() {
        // Movimentação do Jogador
        const speed = 300;
        let pBody = this.player.body;

        pBody.setVelocity(0);

        // Não move se o usuário estiver digitando no input de texto do HTML
        if (document.activeElement.id === 'chat-input') {
            return;
        }

        if (this.cursors.left.isDown || this.keys.A.isDown) {
            pBody.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            pBody.setVelocityX(speed);
        }

        if (this.cursors.up.isDown || this.keys.W.isDown) {
            pBody.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.keys.S.isDown) {
            pBody.setVelocityY(speed);
        }
    }

    setupChatUI() {
        const form = document.getElementById('chat-form');
        const input = document.getElementById('chat-input');
        const log = document.getElementById('chat-log');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (text) {
                // Adiciona no log de mensagens inferior
                const msgEl = document.createElement('div');
                msgEl.className = 'chat-message';
                msgEl.innerHTML = `<strong>Você:</strong> ${text}`;
                log.appendChild(msgEl);
                log.scrollTop = log.scrollHeight;

                // Mostra no balão acima do personagem no jogo
                this.showChatBalloon(text);
                
                input.value = '';
                // Mantém o foco no jogo após enviar, opcional: input.blur();
            }
        });
    }

    showChatBalloon(text) {
        this.chatBalloon.setText(text);
        this.chatBalloon.setVisible(true);
        
        if (this.balloonTimer) {
            this.balloonTimer.remove();
        }

        this.balloonTimer = this.time.delayedCall(4000, () => {
            this.chatBalloon.setVisible(false);
        });
    }
}

// Configuração do motor Phaser
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: MainScene,
    backgroundColor: '#1a1a2e' // Cor que vaza pelas bordas soltas
};

const game = new Phaser.Game(config);

// Redimensionar o Canvas quando a janela mudar de tamanho
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});

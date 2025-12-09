let carrinho = JSON.parse(localStorage.getItem('gameManiaCarrinho')) || [];

document.addEventListener('DOMContentLoaded', () => {
    console.log("Site carregado com sucesso!");

    // Funções placeholder (vazias) para evitar erro se não existirem
    if (typeof atualizarIconesFavoritos === 'function') atualizarIconesFavoritos();
    if (typeof atualizarContadorMenu === 'function') atualizarContadorMenu();

    // 2. ATENÇÃO: Atualiza o modal visualmente assim que o site carrega
    atualizarModalCarrinho();

    // --- LÓGICA DE PESQUISA AVANÇADA ---
    const barraPesquisa = document.getElementById('barraPesquisa');
    const listaSugestoes = document.getElementById('lista-sugestoes');
    const produtos = document.querySelectorAll('.produto-item');
    
    let nomesProdutos = [];
    if(produtos.length > 0) {
        produtos.forEach(prod => {
            const titulo = prod.querySelector('.card-title').textContent.trim();
            if(titulo) nomesProdutos.push(titulo);
        });
    }

    function filtrarProdutos(termo) {
        produtos.forEach(produto => {
            const titulo = produto.querySelector('.card-title').textContent.toLowerCase();
            if(titulo.includes(termo.toLowerCase())) {
                produto.style.display = 'block';
            } else {
                produto.style.display = 'none';
            }
        });
    }

    function salvarHistorico(termo) {
        if(!termo) return;
        let historico = JSON.parse(localStorage.getItem('gameManiaHistorico')) || [];
        historico = historico.filter(item => item.toLowerCase() !== termo.toLowerCase());
        historico.unshift(termo);
        if(historico.length > 5) historico.pop();
        localStorage.setItem('gameManiaHistorico', JSON.stringify(historico));
    }

    function mostrarLista(tipo, itens) {
        if(!listaSugestoes) return; // Evita erro se a barra não existir na página
        listaSugestoes.innerHTML = '';
        
        if (itens.length === 0) {
            listaSugestoes.style.display = 'none';
            return;
        }

        itens.forEach(texto => {
            const li = document.createElement('li');
            li.className = 'list-group-item list-group-item-action';
            const icone = tipo === 'historico' ? '<i class="bi bi-clock-history icone-historico"></i>' : '<i class="bi bi-search icone-historico"></i>';
            li.innerHTML = `${icone} ${texto}`;
            
            li.onclick = () => {
                barraPesquisa.value = texto;
                filtrarProdutos(texto);
                salvarHistorico(texto);
                listaSugestoes.style.display = 'none';
            };
            listaSugestoes.appendChild(li);
        });

        listaSugestoes.style.display = 'block';
    }

    if(barraPesquisa) {
        barraPesquisa.addEventListener('keyup', (e) => {
            const termo = e.target.value;
            if (termo.length === 0) {
                const historico = JSON.parse(localStorage.getItem('gameManiaHistorico')) || [];
                mostrarLista('historico', historico);
                produtos.forEach(p => p.style.display = 'block');
            } else {
                const sugestoes = nomesProdutos.filter(nome => nome.toLowerCase().includes(termo.toLowerCase()));
                mostrarLista('sugestao', sugestoes);
                filtrarProdutos(termo);
            }
        });

        barraPesquisa.addEventListener('focus', () => {
            const termo = barraPesquisa.value;
            if (termo.length === 0) {
                const historico = JSON.parse(localStorage.getItem('gameManiaHistorico')) || [];
                mostrarLista('historico', historico);
            }
        });

        document.addEventListener('click', (e) => {
            if (!barraPesquisa.contains(e.target) && !listaSugestoes.contains(e.target)) {
                listaSugestoes.style.display = 'none';
            }
        });
    }
});

// --- FUNÇÃO AUXILIAR PARA SALVAR NO LOCALSTORAGE ---
function salvarCarrinho() {
    localStorage.setItem('gameManiaCarrinho', JSON.stringify(carrinho));
}

// --- FUNÇÕES DO CARRINHO ---

function adicionarAoCarrinho(nome, precoString) {
    let precoNumerico = parseFloat(precoString.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());

    const produto = {
        id: Date.now(),
        nome: nome,
        preco: precoNumerico,
        precoFormatado: precoString
    };

    carrinho.push(produto);
    
    // 3. Salva no localStorage
    salvarCarrinho();

    atualizarModalCarrinho();
    mostrarNotificacao(nome);
}

function removerDoCarrinho(idProduto) {
    carrinho = carrinho.filter(item => item.id !== idProduto);
    
    // 4. Salva a remoção no localStorage
    salvarCarrinho();
    
    atualizarModalCarrinho();
}

function finalizarCompra() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    alert('Compra finalizada com sucesso! Obrigado pela preferência.');

    carrinho = [];
    
    // 5. Limpa o localStorage também
    salvarCarrinho();
    
    atualizarModalCarrinho();

    const modalElement = document.getElementById('modalCarrinho');
    if (modalElement && window.bootstrap) {
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if(modalInstance){
            modalInstance.hide();
        }
    }
}

function atualizarModalCarrinho() {
    const listaElement = document.getElementById('lista-carrinho');
    const totalElement = document.getElementById('total-carrinho');
    const contadorElement = document.getElementById('contador-carrinho');

    // Verificação de segurança caso os elementos não existam na página
    if(!listaElement || !totalElement || !contadorElement) return;

    listaElement.innerHTML = '';

    let total = 0;

    if (carrinho.length === 0) {
        listaElement.innerHTML = '<div class="text-center py-3"><i class="bi bi-cart-x fs-1 text-muted"></i><p class="mt-2">Seu carrinho está vazio.</p></div>';
        totalElement.textContent = 'R$ 0,00';
        contadorElement.style.display = 'none';
        return;
    }

    carrinho.forEach(item => {
        total += item.preco;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        itemDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-box-seam me-3 text-primary fs-4"></i>
                <div>
                    <h6 class="mb-0">${item.nome}</h6>
                    <small class="text-muted">Unidade</small>
                </div>
            </div>
            <div class="d-flex align-items-center">
                <span class="fw-bold text-dark me-3">${item.precoFormatado}</span>
                <button class="btn btn-outline-danger btn-sm rounded-circle" onclick="removerDoCarrinho(${item.id})" title="Remover item">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        `;
        listaElement.appendChild(itemDiv);
    });

    totalElement.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    contadorElement.textContent = carrinho.length;
    contadorElement.style.display = 'block';
}

function mostrarNotificacao(nomeProduto) {
    // Verifica se a função alert é intrusiva demais, mas mantém como pedido
    // Idealmente usaria um 'Toast' do bootstrap, mas vamos manter simples
    alert(`O produto "${nomeProduto}" foi adicionado ao carrinho!`);
    
    const cartIcon = document.querySelector('.bi-cart3');
    if(cartIcon) {
        cartIcon.classList.add('text-warning');
        setTimeout(() => {
            cartIcon.classList.remove('text-warning');
        }, 500);
    }
}

// Placeholder da função de favoritos (para não dar erro no console)
function toggleHeart(element) {
    const icon = element.querySelector('i');
    if(icon) {
        if (icon.classList.contains('bi-heart')) {
            icon.classList.remove('bi-heart');
            icon.classList.add('bi-heart-fill', 'text-danger');
        } else {
            icon.classList.remove('bi-heart-fill', 'text-danger');
            icon.classList.add('bi-heart');
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const btnSalvar = document.getElementById('btnSalvar');

    // Só executa se o botão existir na página (para não dar erro em outras páginas)
    if (btnSalvar) {
        btnSalvar.addEventListener('click', (event) => {
            // 1. Impede que o link abra a página "sucesso.html" imediatamente
            event.preventDefault();

            let temErro = false;
            
            // Seleciona todos os inputs que possuem o atributo 'required' dentro do formulário
            const inputsObrigatorios = document.querySelectorAll('.form-cadastro input[required]');

            inputsObrigatorios.forEach(input => {
                // Remove erro antigo (se houver) para verificar novamente
                input.classList.remove('input-erro');
                const msgAntiga = input.parentNode.querySelector('.msg-erro');
                if (msgAntiga) {
                    msgAntiga.remove();
                }

                // Verifica se o valor está vazio
                if (input.value.trim() === "") {
                    temErro = true;
                    
                    // Adiciona a classe que faz brilhar vermelho
                    input.classList.add('input-erro');

                    // Cria a mensagem de texto
                    const spanErro = document.createElement('span');
                    spanErro.classList.add('msg-erro');
                    spanErro.innerText = "Resposta obrigatória";
                    
                    // Adiciona a mensagem logo após o input
                    input.parentNode.appendChild(spanErro);
                }
            });

            // 2. Se NÃO tiver erro, aí sim redireciona para a página de sucesso
            if (!temErro) {
                window.location.href = "sucesso.html";
            } else {
                // Opcional: Rola a página até o primeiro erro para o usuário ver
                const primeiroErro = document.querySelector('.input-erro');
                if(primeiroErro) {
                    primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
        
        // Extra: Remove o vermelho assim que o usuário começar a digitar
        const inputs = document.querySelectorAll('.form-cadastro input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('input-erro');
                const msg = input.parentNode.querySelector('.msg-erro');
                if (msg) msg.remove();
            });
        });
    }
});
let characters = []; 
let magicItems = [];
let nextCharId = 1;  
let nextItemId = 1;
let nextCharId = characters.length > 0 ? Math.max(...characters.map(c => c.id)) + 1 : 1;
let nextItemId = magicItems.length > 0 ? Math.max(...magicItems.map(i => i.id)) + 1 : 1;
const charForm = document.getElementById('charForm');
const itemForm = document.getElementById('itemForm');
const charTable = document.getElementById('charsTable').querySelector('tbody');
const itemTable = document.getElementById('itemsTable').querySelector('tbody');
const charSelect = document.getElementById('selectChar');
const itemSelect = document.getElementById('selectItem');
const linkBtn = document.getElementById('linkBtn');
const charItemsDiv = document.getElementById('charItems');
document.addEventListener('DOMContentLoaded', function() {
    loadCharacters();
    loadItems();
    updateSelects();
    document.getElementById('charStr').addEventListener('change', validateAttributes);
    document.getElementById('charDef').addEventListener('change', validateAttributes);
    document.getElementById('itemType').addEventListener('change', function() {
        const type = this.value;
        const strInput = document.getElementById('itemStr');
        const defInput = document.getElementById('itemDef');
        if (type === 'Arma') {
            strInput.disabled = false;
            defInput.value = 0;
            defInput.disabled = true;
        } 
        else if (type === 'Armadura') {
            strInput.value = 0;
            strInput.disabled = true;
            defInput.disabled = false;
        } 
        else {
            strInput.disabled = false;
            defInput.disabled = false;
        }
    });
    charForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveCharacter();
    });
    itemForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveItem();
    });
    linkBtn.addEventListener('click', linkItem);
    document.getElementById('cancelBtn').addEventListener('click', resetCharForm);
    document.getElementById('cancelItemBtn').addEventListener('click', resetItemForm);
});
function loadCharacters() {
    charTable.innerHTML = '';
    characters.forEach(char => {
        const row = document.createElement('tr');
        let totalStr = char.str;
        let totalDef = char.def;
        char.items.forEach(itemId => {
            const item = magicItems.find(i => i.id === itemId);
            if (item) {
                totalStr += item.str;
                totalDef += item.def;
            }
        });
        row.innerHTML = `
            <td>${char.id}</td>
            <td>${char.name}</td>
            <td>${char.class}</td>
            <td>${char.level}</td>
            <td>
                <button onclick="editCharacter(${char.id})">Editar</button>
                <button onclick="deleteCharacter(${char.id})" class="btn-danger">Remover</button>
                <button onclick="showCharItems(${char.id})">Itens</button>
            </td>
        `;
        charTable.appendChild(row);
    });
}
function saveCharacter() {
    const id = document.getElementById('charId').value;
    const name = document.getElementById('charName').value.trim();
    const player = document.getElementById('playerName').value.trim();
    const charClass = document.getElementById('charClass').value;
    const level = parseInt(document.getElementById('charLevel').value);
    const str = parseInt(document.getElementById('charStr').value);
    const def = parseInt(document.getElementById('charDef').value);
    if (str + def > 10) {
        showMessage('charMessage', 'A soma de Força e Defesa não pode passar de 10!', 'error');
        return;
    }
    const charData = {
        id: id ? parseInt(id) : nextCharId++,
        name,
        player,
        class: charClass,
        level,
        str,
        def,
        items: id ? characters.find(c => c.id == id).items : []
    };
    if (id) {
        const index = characters.findIndex(c => c.id == id);
        characters[index] = charData;
        showMessage('charMessage', 'Personagem atualizado!', 'success');
    } else {
        characters.push(charData);
        showMessage('charMessage', 'Personagem criado!', 'success');
    }
    resetCharForm();
    loadCharacters();
    updateSelects();
}
function editCharacter(id) {
    const char = characters.find(c => c.id === id);
    if (!char) return;
    document.getElementById('charId').value = char.id;
    document.getElementById('charName').value = char.name;
    document.getElementById('playerName').value = char.player;
    document.getElementById('charClass').value = char.class;
    document.getElementById('charLevel').value = char.level;
    document.getElementById('charStr').value = char.str;
    document.getElementById('charDef').value = char.def;
    charForm.scrollIntoView({ behavior: 'smooth' });
}
function deleteCharacter(id) {
    if (!confirm('Tem certeza? Isso removerá todos os itens.')) return;
    characters = characters.filter(c => c.id !== id);
    loadCharacters();
    updateSelects();
}
function resetCharForm() {
    charForm.reset();
    document.getElementById('charId').value = '';
    document.getElementById('charStr').value = '5';
    document.getElementById('charDef').value = '5';
    document.getElementById('charMessage').style.display = 'none';
}
function validateAttributes() {
    const str = parseInt(document.getElementById('charStr').value) || 0;
    const def = parseInt(document.getElementById('charDef').value) || 0;
    const total = str + def;
    if (total > 10) {
        showMessage('charMessage', `Pontos excedidos (${total}/10)! Ajustar os valores para que fiquem no max 10!.`, 'error');
        return false;
    }
    document.getElementById('charMessage').style.display = 'none';
    return true;
}
function loadItems() {
    itemTable.innerHTML = '';
    magicItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.type}</td>
            <td>${item.str}</td>
            <td>${item.def}</td>
            <td>
                <button onclick="editItem(${item.id})">Editar</button>
                <button onclick="deleteItem(${item.id})" class="btn-danger">Remover</button>
            </td>
        `;
        itemTable.appendChild(row);
    });
}
function saveItem() {
    const id = document.getElementById('itemId').value;
    const name = document.getElementById('itemName').value.trim();
    const type = document.getElementById('itemType').value;
    const str = parseInt(document.getElementById('itemStr').value) || 0;
    const def = parseInt(document.getElementById('itemDef').value) || 0;
    if (str === 0 && def === 0) {
        showMessage('itemMessage', 'O item precisa ter minimo 1 ponto em Força ou Defesa!', 'error');
        return;
    }
    if (type === 'Arma' && def !== 0) {
        showMessage('itemMessage', 'Armas não tem defesa!', 'error');
        return;
    }
    if (type === 'Armadura' && str !== 0) {
        showMessage('itemMessage', 'Armaduras não tem força!', 'error');
        return;
    }
    const itemData = {
        id: id ? parseInt(id) : nextItemId++,
        name,
        type,
        str,
        def
    };
    if (id) {
        const index = magicItems.findIndex(i => i.id == id);
        magicItems[index] = itemData;
        showMessage('itemMessage', 'Item atualizado!', 'success');
    } else {
        magicItems.push(itemData);
        showMessage('itemMessage', 'Item criado!', 'success');
    }
    resetItemForm();
    loadItems();
    updateSelects();
}
function editItem(id) {
    const item = magicItems.find(i => i.id === id);
    if (!item) return;
    document.getElementById('itemId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemType').value = item.type;
    document.getElementById('itemStr').value = item.str;
    document.getElementById('itemDef').value = item.def;
    document.getElementById('itemType').dispatchEvent(new Event('change'));
    itemForm.scrollIntoView({ behavior: 'smooth' });
}
function deleteItem(id) {
    if (!confirm('Remover este item, de todos os personagens')) return;
    characters.forEach(char => {
        char.items = char.items.filter(itemId => itemId !== id);
    });
    magicItems = magicItems.filter(i => i.id !== id);
    loadItems();
    updateSelects();
    loadCharacters();
}
function resetItemForm() {
    itemForm.reset();
    document.getElementById('itemId').value = '';
    document.getElementById('itemStr').value = '0';
    document.getElementById('itemDef').value = '0';
    document.getElementById('itemMessage').style.display = 'none';
    document.getElementById('itemStr').disabled = false;
    document.getElementById('itemDef').disabled = false;
}
function updateSelects() {
    charSelect.innerHTML = '<option value="">Selecione</option>';
    characters.forEach(char => {
        const option = document.createElement('option');
        option.value = char.id;
        option.textContent = `${char.name} (${char.class})`;
        charSelect.appendChild(option);
    });
    itemSelect.innerHTML = '<option value="">Selecione</option>';
    magicItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.name} (${item.type})`;
        itemSelect.appendChild(option);
    });}
function linkItem() {
    const charId = parseInt(charSelect.value);
    const itemId = parseInt(itemSelect.value);
    if (!charId || !itemId) {
        showMessage('linkMessage', 'Selecione um personagem e um item!', 'error');
        return;
    }
    const char = characters.find(c => c.id === charId);
    const item = magicItems.find(i => i.id === itemId);
    if (!char || !item) {
        showMessage('linkMessage','Erro. digite um nome válido', 'error');
        return;
    }
    if (char.items.includes(itemId)) {
        showMessage('linkMessage', 'Este item já está vinculado a um personagem!', 'error');
        return;
    }
    if (item.type === 'Amuleto') {
        const hasAmulet = char.items.some(id => {
            const i = magicItems.find(it => it.id === id);
            return i && i.type === 'Amuleto';
        });
        
        if (hasAmulet) {
            showMessage('linkMessage', 'O personagem já tem um amuleto!', 'error');
            return;
        }
    }
    char.items.push(itemId);
    showMessage('linkMessage', 'Item vinculado com sucesso!', 'success');
    loadCharacters();
    showCharItems(charId);
}
function showCharItems(charId) {
    const char = characters.find(c => c.id === charId);
    if (!char) return;
    let html = `<h4>Itens de ${char.name}</h4>`;
    if (char.items.length === 0) {
        html += '<p>Nenhum item equipado.</p>';
    } else {
        html += '<ul style="list-style-type: none; padding: 0;">';
        char.items.forEach(itemId => {
            const item = magicItems.find(i => i.id === itemId);
            if (item) {
                html += `
                    <li style="background: #f8f9fa; padding: 8px; margin-bottom: 5px; border-radius: 4px;">
                        <strong>${item.name}</strong> (${item.type})
                        <br>Força: +${item.str} | Defesa: +${item.def}
                        <button onclick="removeCharItem(${charId}, ${itemId})" class="btn-danger" style="float: right; padding: 2px 8px;">X</button>
                    </li>
                `;
            }
        });
        html += '</ul>';
    }
    const amulet = char.items.find(itemId => {
        const item = magicItems.find(i => i.id === itemId);
        return item && item.type === 'Amuleto';
    });
    if (amulet) {
        const item = magicItems.find(i => i.id === amulet);
        html += `
            <div style="background: #e8f5e9; padding: 10px; border-radius: 4px; margin-top: 10px;">
                <h5>Amuleto Equipado</h5>
                <p><strong>${item.name}</strong> - Força: +${item.str}, Defesa: +${item.def}</p>
            </div>
        `;
    }
    const totalStr = char.str + char.items.reduce((sum, id) => {
        const item = magicItems.find(i => i.id === id);
        return sum + (item ? item.str : 0);
    }, 0);
    const totalDef = char.def + char.items.reduce((sum, id) => {
        const item = magicItems.find(i => i.id === id);
        return sum + (item ? item.def : 0);
    }, 0);
    html += `
        <div style="margin-top: 15px; background: #e3f2fd; padding: 10px; border-radius: 4px;">
            <h5>Atributos Totais</h5>
            <p><strong>Força:</strong> ${totalStr} (base ${char.str} + itens ${totalStr - char.str})</p>
            <p><strong>Defesa:</strong> ${totalDef} (base ${char.def} + itens ${totalDef - char.def})</p>
        </div>
    `;
    charItemsDiv.innerHTML = html;
    charItemsDiv.scrollIntoView({ behavior: 'smooth' });
}
function removeCharItem(charId, itemId) {
    const char = characters.find(c => c.id === charId);
    if (!char) return;
    
    char.items = char.items.filter(id => id !== itemId);
    showCharItems(charId);
    loadCharacters();
}
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `alert alert-${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}
window.editCharacter = editCharacter;
window.deleteCharacter = deleteCharacter;
window.showCharItems = showCharItems;
window.editItem = editItem;
window.deleteItem = deleteItem;
window.removeCharItem = removeCharItem;
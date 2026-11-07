import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, watch, writeFileSync } from 'node:fs';
import { randomBytes, randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const passesPath = path.join(root, 'passes.json');
const statePath = path.join(root, 'data', 'state.json');
const port = Number(process.env.PORT || 8787);
const maxGuests = 4;
const presenceTtl = 20000;

function loadPasses() {
  try {
    const parsed = JSON.parse(readFileSync(passesPath, 'utf8'));
    const codes = Array.isArray(parsed.codes) ? parsed.codes : [];
    return new Set(codes.map((code) => String(code).trim().toUpperCase()).filter(Boolean));
  } catch (error) {
    console.error('Não consegui ler passes.json', error);
    return new Set();
  }
}

function loadState() {
  if (!existsSync(statePath)) return { users: {}, usedPasses: {}, lists: {} };
  try {
    const parsed = JSON.parse(readFileSync(statePath, 'utf8'));
    return {
      users: parsed.users && typeof parsed.users === 'object' ? parsed.users : {},
      usedPasses: parsed.usedPasses && typeof parsed.usedPasses === 'object' ? parsed.usedPasses : {},
      lists: parsed.lists && typeof parsed.lists === 'object' ? parsed.lists : {},
    };
  } catch (error) {
    console.error('Estado inválido, começando vazio', error);
    return { users: {}, usedPasses: {}, lists: {} };
  }
}

let passes = loadPasses();
const state = loadState();
const presence = new Map();
let io;

function saveState() {
  mkdirSync(path.dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify(state));
}

try {
  watch(passesPath, () => {
    passes = loadPasses();
  });
} catch {
  // O arquivo pode ser recriado; a leitura também acontece a cada resgate.
}

function normalizeCode(value) {
  return String(value ?? '').trim().toUpperCase().replace(/\s+/g, '');
}

function makeInviteCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return [...randomBytes(6)].map((byte) => alphabet[byte % alphabet.length]).join('');
}

function send(socket, message) {
  socket.emit(message.type, message);
}

function joinRoom(socket, listId) {
  socket.watching.add(listId);
  socket.join(`list:${listId}`);
}

function guestsOf(list) {
  return list.members.filter((member) => member.role !== 'owner').length;
}

function sanitizeItem(value) {
  if (!value?.id || typeof value.title !== 'string') return null;
  const price = Number(value.price);
  const store = typeof value.store === 'string' ? value.store.trim() : '';
  const note = typeof value.note === 'string' ? value.note.trim() : '';
  return {
    id: String(value.id),
    title: value.title.trim().slice(0, 48),
    price: Number.isFinite(price) ? price : 0,
    unities: Math.max(1, Math.round(Number(value.unities) || 1)),
    isCompleted: Boolean(value.isCompleted),
    barcode: typeof value.barcode === 'string' ? value.barcode : undefined,
    note: note || undefined,
    store: store || undefined,
    categoryId: typeof value.categoryId === 'string' && value.categoryId ? String(value.categoryId) : undefined,
  };
}

function sanitizeCategory(value) {
  if (!value?.id || typeof value.name !== 'string') return null;
  const name = value.name.trim().slice(0, 24);
  const color = typeof value.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value.color) ? value.color : '#1B6B4A';
  const icon = typeof value.icon === 'string' && /^[a-z0-9-]{1,40}$/.test(value.icon) ? value.icon : 'shopping-bag';
  if (!name) return null;
  return { id: String(value.id), name, color, icon };
}

function listView(list) {
  return {
    id: list.id,
    title: list.title,
    createdAt: list.createdAt,
    ownerId: list.ownerId,
    inviteCode: list.inviteCode,
    members: list.members,
    items: list.items,
    categories: list.categories ?? [],
    activity: list.activity,
  };
}

function peopleOf(listId) {
  const room = presence.get(listId);
  if (!room) return [];
  const now = Date.now();
  const people = [];
  for (const [userId, entry] of room) {
    if (now - entry.at > presenceTtl) {
      room.delete(userId);
      continue;
    }
    people.push({ userId, name: entry.name, mode: entry.mode });
  }
  return people;
}

function broadcast(listId, message) {
  io.to(`list:${listId}`).emit(message.type, message);
}

function broadcastPresence(listId) {
  broadcast(listId, { type: 'presence', listId, people: peopleOf(listId) });
}

function pushActivity(list, user, text) {
  list.activity.unshift({
    id: randomUUID(),
    at: new Date().toISOString(),
    userId: user.id,
    name: user.name,
    text,
  });
  list.activity = list.activity.slice(0, 200);
}

function isMember(list, userId) {
  return list.members.some((member) => member.userId === userId);
}

function renameMemberships(user) {
  for (const list of Object.values(state.lists)) {
    let changed = false;
    for (const member of list.members) {
      if (member.userId === user.id && member.name !== user.name) {
        member.name = user.name;
        changed = true;
      }
    }
    if (changed) {
      saveState();
      broadcast(list.id, { type: 'list', list: listView(list), people: peopleOf(list.id) });
    }
  }
}

function fail(socket, requestId, error) {
  send(socket, { type: 'result', requestId, ok: false, error });
}

function ok(socket, requestId, extra = {}) {
  send(socket, { type: 'result', requestId, ok: true, ...extra });
}

function publishList(list) {
  broadcast(list.id, { type: 'list', list: listView(list), people: peopleOf(list.id) });
}

function describeEdit(previous, next) {
  if (previous.title !== next.title) return `renomeou “${previous.title}” para “${next.title}”`;
  const priceChanged = previous.price !== next.price || (previous.store || '') !== (next.store || '');
  if (priceChanged) {
    const where = next.store ? ` no ${next.store}` : '';
    return `anotou o preço de ${next.title}${where}`;
  }
  if (previous.isCompleted !== next.isCompleted) {
    return next.isCompleted ? `colocou ${next.title} no carrinho` : `tirou ${next.title} do carrinho`;
  }
  return `editou ${next.title}`;
}

function onMessage(socket, message) {
  if (message.type === 'hello') {
    const id = String(message.userId || '').trim();
    const name = String(message.name || '').trim().slice(0, 32) || 'Alguém';
    if (!id) return fail(socket, message.requestId, 'Faltou identificar o celular.');
    const existing = state.users[id] ?? { id, premium: false };
    existing.name = name;
    existing.premium = Boolean(existing.premium);
    state.users[id] = existing;
    socket.user = existing;
    saveState();
    renameMemberships(existing);
    send(socket, {
      type: 'welcome',
      user: { id: existing.id, name: existing.name, premium: existing.premium },
    });
    return;
  }

  if (!socket.user) return fail(socket, message.requestId, 'Ainda não apresentei esse celular.');

  if (message.type === 'rename') {
    socket.user.name = String(message.name || '').trim().slice(0, 32) || 'Alguém';
    saveState();
    renameMemberships(socket.user);
    ok(socket, message.requestId);
    return;
  }

  if (message.type === 'redeem') {
    passes = loadPasses();
    const code = normalizeCode(message.code);
    if (!code) return fail(socket, message.requestId, 'Digite o código.');
    if (socket.user.premium) return fail(socket, message.requestId, 'Este celular já está no premium.');
    if (state.usedPasses[code]) return fail(socket, message.requestId, 'Esse código já foi usado.');
    if (!passes.has(code)) return fail(socket, message.requestId, 'Não encontrei esse código.');
    state.usedPasses[code] = { userId: socket.user.id, at: new Date().toISOString() };
    socket.user.premium = true;
    socket.user.passCode = code;
    saveState();
    ok(socket, message.requestId, { premium: true });
    return;
  }

  if (message.type === 'share') {
    if (!socket.user.premium) {
      return fail(socket, message.requestId, 'Só quem está no premium pode abrir a lista para a casa.');
    }
    const incoming = message.list;
    if (!incoming?.id || !incoming.title) return fail(socket, message.requestId, 'Lista incompleta.');
    let list = state.lists[incoming.id];
    if (list && list.ownerId !== socket.user.id) {
      return fail(socket, message.requestId, 'Essa lista pertence a outra pessoa.');
    }
    if (!list) {
      list = {
        id: String(incoming.id),
        title: String(incoming.title).trim().slice(0, 40),
        createdAt: incoming.createdAt || new Date().toISOString(),
        ownerId: socket.user.id,
        inviteCode: makeInviteCode(),
        members: [{ userId: socket.user.id, name: socket.user.name, role: 'owner' }],
        items: (Array.isArray(incoming.items) ? incoming.items : []).map(sanitizeItem).filter(Boolean),
        categories: (Array.isArray(incoming.categories) ? incoming.categories : []).map(sanitizeCategory).filter(Boolean).slice(0, 12),
        activity: [],
      };
      pushActivity(list, socket.user, 'abriu a lista para a casa');
      state.lists[list.id] = list;
    } else {
      list.title = String(incoming.title).trim().slice(0, 40) || list.title;
    }
    saveState();
    joinRoom(socket, list.id);
    touch(socket, list.id, 'online');
    ok(socket, message.requestId, { list: listView(list), people: peopleOf(list.id) });
    publishList(list);
    return;
  }

  if (message.type === 'join') {
    const code = normalizeCode(message.code);
    const list = Object.values(state.lists).find((entry) => entry.inviteCode === code);
    if (!list) return fail(socket, message.requestId, 'Não achei uma lista com esse código.');
    if (!isMember(list, socket.user.id)) {
      if (guestsOf(list) >= maxGuests) {
        return fail(socket, message.requestId, 'Essa lista já tem 4 pessoas além de quem assina.');
      }
      list.members.push({ userId: socket.user.id, name: socket.user.name, role: 'member' });
      pushActivity(list, socket.user, 'entrou na lista');
      saveState();
    }
    joinRoom(socket, list.id);
    touch(socket, list.id, 'online');
    ok(socket, message.requestId, { list: listView(list), people: peopleOf(list.id) });
    publishList(list);
    return;
  }

  if (message.type === 'watch') {
    const list = state.lists[message.listId];
    if (!list || !isMember(list, socket.user.id)) return;
    joinRoom(socket, list.id);
    touch(socket, list.id, message.mode === 'adding' ? 'adding' : 'online');
    send(socket, { type: 'list', list: listView(list), people: peopleOf(list.id) });
    return;
  }

  if (message.type === 'presence') {
    const list = state.lists[message.listId];
    if (!list || !socket.watching.has(list.id)) return;
    touch(socket, list.id, message.mode === 'adding' ? 'adding' : 'online');
    return;
  }

  if (message.type === 'unwatch') {
    leaveWatch(socket, message.listId);
    return;
  }

  if (message.type === 'op') {
    const list = state.lists[message.listId];
    if (!list || !isMember(list, socket.user.id)) {
      return fail(socket, message.requestId, 'Você não está nessa lista.');
    }
    const op = message.op ?? {};
    if (op.kind === 'add') {
      const item = sanitizeItem(op.item);
      if (!item) return fail(socket, message.requestId, 'Item incompleto.');
      if (!list.items.some((current) => current.id === item.id)) list.items.push(item);
      pushActivity(list, socket.user, `adicionou ${item.title}`);
    } else if (op.kind === 'edit') {
      const item = sanitizeItem(op.item);
      if (!item) return fail(socket, message.requestId, 'Item incompleto.');
      const index = list.items.findIndex((current) => current.id === item.id);
      if (index === -1) list.items.push(item);
      else {
        const previous = list.items[index];
        list.items[index] = item;
        const onlyMoved = (previous.categoryId || '') !== (item.categoryId || '')
          && previous.title === item.title
          && previous.price === item.price
          && (previous.store || '') === (item.store || '')
          && previous.isCompleted === item.isCompleted
          && previous.unities === item.unities
          && (previous.note || '') === (item.note || '');
        if (onlyMoved) {
          const target = (list.categories ?? []).find((category) => category.id === item.categoryId);
          pushActivity(list, socket.user, target ? `moveu ${item.title} para ${target.name}` : `tirou ${item.title} da categoria`);
        } else {
          pushActivity(list, socket.user, describeEdit(previous, item));
        }
      }
      if (index === -1) pushActivity(list, socket.user, `adicionou ${item.title}`);
    } else if (op.kind === 'remove') {
      const title = list.items.find((item) => item.id === op.itemId)?.title || op.title || 'um item';
      list.items = list.items.filter((item) => item.id !== op.itemId);
      pushActivity(list, socket.user, `tirou ${title}`);
    } else if (op.kind === 'clear') {
      list.items = [];
      pushActivity(list, socket.user, 'esvaziou a lista');
    } else if (op.kind === 'category') {
      const category = sanitizeCategory(op.category);
      if (!category) return fail(socket, message.requestId, 'Categoria incompleta.');
      list.categories = list.categories ?? [];
      const index = list.categories.findIndex((current) => current.id === category.id);
      if (index === -1) {
        if (list.categories.length >= 12) return fail(socket, message.requestId, 'Dá para ter até 12 categorias.');
        list.categories.push(category);
        pushActivity(list, socket.user, `criou a categoria ${category.name}`);
      } else {
        list.categories[index] = category;
        pushActivity(list, socket.user, `ajustou a categoria ${category.name}`);
      }
    } else if (op.kind === 'drop-category') {
      const id = String(op.categoryId || '');
      const name = (list.categories ?? []).find((category) => category.id === id)?.name || op.name || 'uma categoria';
      list.categories = (list.categories ?? []).filter((category) => category.id !== id);
      for (const item of list.items) {
        if (item.categoryId === id) delete item.categoryId;
      }
      pushActivity(list, socket.user, `removeu a categoria ${name}`);
    } else {
      return fail(socket, message.requestId, 'Não entendi a alteração.');
    }
    saveState();
    publishList(list);
    if (message.requestId) ok(socket, message.requestId);
    return;
  }

  if (message.type === 'delete') {
    const list = state.lists[message.listId];
    if (!list) return ok(socket, message.requestId);
    if (list.ownerId !== socket.user.id) return fail(socket, message.requestId, 'Só quem criou a lista pode apagá-la para todo mundo.');
    delete state.lists[list.id];
    presence.delete(list.id);
    saveState();
    broadcast(list.id, { type: 'deleted', listId: list.id });
    ok(socket, message.requestId);
  }
}

function touch(socket, listId, mode) {
  let room = presence.get(listId);
  if (!room) {
    room = new Map();
    presence.set(listId, room);
  }
  room.set(socket.user.id, { name: socket.user.name, mode, at: Date.now() });
  broadcastPresence(listId);
}

function leaveWatch(socket, listId) {
  socket.watching?.delete(listId);
  socket.leave(`list:${listId}`);
  const room = presence.get(listId);
  if (room && socket.user) {
    room.delete(socket.user.id);
    broadcastPresence(listId);
  }
}

const server = createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ ok: true }));
    return;
  }
  response.writeHead(404);
  response.end();
});

io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.watching = new Set();
  socket.user = null;
  const types = ['hello', 'rename', 'redeem', 'share', 'join', 'watch', 'presence', 'unwatch', 'op', 'delete'];

  for (const type of types) {
    socket.on(type, (message = {}) => {
      try {
        onMessage(socket, { ...message, type });
      } catch (error) {
        console.error(error);
        send(socket, { type: 'result', ok: false, error: 'Mensagem inválida.' });
      }
    });
  }

  socket.on('disconnect', () => {
    for (const listId of [...socket.watching]) leaveWatch(socket, listId);
  });
});

setInterval(() => {
  for (const listId of presence.keys()) broadcastPresence(listId);
}, 5000);

server.listen(port, '0.0.0.0', () => {
  console.log(`Shopit casa em http://0.0.0.0:${port}`);
});

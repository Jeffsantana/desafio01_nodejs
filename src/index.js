const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userExist = users.find( user => {
    if(user.username === username) return user;
  });
  if (!userExist) {
    return response.status(400).json({ error: "Mensagem de erro"});
  }
  request.user = userExist;
  next();
}
function checksExistsUser(request, response, next) {
  const { username } = request.body;
  const userExist = users.find( user => {
    if(user.username === username) return user;
  });
  if (userExist) {
    return response.status(400).json({ error: "Mensagem de erro"});
  }
  next();
}

// insert user
app.post('/users', checksExistsUser, (request, response) => {
  const { name, username } = request.body;
  const user = {
    name, 
    username, 
    id:uuidv4(),
    todos:[]
  }
  users.push(user);
  return response.status(201).json(user);
});
// list users
app.get('/users', (request,response) =>{
  response.send(users);
});
// insert todo
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, done, deadLine } = request.body;
  const user = request.user;
  user.todos.push({
    title,
    done,
    id:uuidv4(),
    deadLine: new Date(deadLine),
    created_at: new Date(),
  })
  return response.status(201).send();
});
// list todos
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  return response.json(user.todos)
});
// Update Todo
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadLine } = request.body;
  const user = request.user;
  const todoExist = user.todos.some(item =>{
    if (item.id === id){
        item.title = title;
        item.deadLine = deadLine;
        return true;
    } 
  });
  if (!todoExist) {
    return response.status(404).json({ error: "Mensagem de erro"});
  }
  return response.json(user.todos)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;
  const todoExist = user.todos.some(item =>{
    if (item.id === id){
        item.done = true;
        return true;
    } 
  });
  if (!todoExist) {
    return response.status(404).json({ error: "Mensagem de erro"});
  }
  return response.json(user.todos)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;
  const todoExist = user.todos.some(item =>{
    if (item.id === id){
        return true;
    } 
  });
  if (!todoExist) {
    return response.status(404).json({ error: "Mensagem de erro"});
  }
  user.todos.splice(id,1);
  return response.json(user.todos)
});

module.exports = app;
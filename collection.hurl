POST http://localhost:3000/api/todos
{
  "title": "Learn Node.js",
  "dueDate": "2024-01-01T00:00:00Z"
}
HTTP 201
[Captures]
todoId: jsonpath "$['id']"

GET http://localhost:3000/api/todos/{{todoId}}
HTTP 200

GET http://localhost:3000/api/todos?completed
HTTP 200

GET http://localhost:3000/api/todos?pending
HTTP 200

GET http://localhost:3000/api/todos
HTTP 200

PUT http://localhost:3000/api/todos/{{todoId}}
{
  "title": "Learn Node.js",
  "dueDate": "2024-01-01T00:00:00Z",
  "completed": true
}
HTTP 200

DELETE http://localhost:3000/api/todos/{{todoId}}
HTTP 204

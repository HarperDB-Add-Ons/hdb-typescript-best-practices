import { TodoItemClient } from '../data/TodoItemClient.js'
import { TodoItem, TodoObjectCreationType, TodoObjectType, TodoObjectUpdateType } from '../domain/TodoItem.js'

export class TodoItemService {
  #client: TodoItemClient
  constructor(client: TodoItemClient) {
    this.#client = client
  }

  async findOne(id: string) {
    return this.#client.findOne(id)
  }

  async findAll() {
    return [...(await this.findPending()), ...(await this.findCompleted())]
  }

  async findCompleted() {
    return this.#client.listByStatus(true)
  }

  async findPending() {
    return this.#client.listByStatus(false)
  }

  async create(todoItem: TodoObjectCreationType) {
    const todo = new TodoItem(todoItem.title, new Date(todoItem.dueDate))
    return this.#client.upsert(todo)
  }

  async update(todoItem: TodoObjectUpdateType) {
    const todo = await this.#client.findOne(todoItem.id ?? '')

    if (!todo) {
      throw new Error('Todo not found')
    }

    todo.completed = todoItem.completed ?? todo.completed
    todo.dueDate = new Date(todoItem.dueDate ?? todo.dueDate)
    todo.title = todoItem.title ?? todo.title

    console.log(todo)

    return this.#client.upsert(todo)
  }

  async delete(id: string) {
    return this.#client.delete(id)
  }
}

import { TodoItem, TodoObjectType } from '../domain/TodoItem.js'

export class TodoItemClient {
  #defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  credentialsBuffer: Buffer

  constructor(
    private readonly url: string,
    private readonly schema: string,
    private readonly table: string,
    credentials: { username: string; password: string }
  ) {
    this.credentialsBuffer = Buffer.from(`${credentials.username}:${credentials.password}`)
    this.#defaultHeaders['Authorization'] = `Basic ${this.credentialsBuffer.toString('base64url')}`
  }

  async upsert(data: TodoItem) {
    const payload = {
      operation: 'upsert',
      schema: this.schema,
      table: this.table,
      records: [data.toObject()]
    }

    const response = await fetch(this.url, {
      method: 'POST',
      headers: this.#defaultHeaders,
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(response.statusText)
    }

    return data
  }

  async delete(id: string) {
    const payload = {
      operation: 'delete',
      schema: this.schema,
      table: this.table,
      hash_values: [id]
    }

    const response = await fetch(this.url, {
      method: 'POST',
      headers: this.#defaultHeaders,
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(response.statusText)
    }
  }

  async findOne(id: string) {
    const payload = {
      operation: 'search_by_hash',
      schema: this.schema,
      table: this.table,
      hash_values: [id],
      get_attributes: ['*']
    }

    const response = await fetch(this.url, {
      method: 'POST',
      headers: this.#defaultHeaders,
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(response.statusText)
    }

    const data = (await response.json()) as TodoObjectType[]
    if (data[0] && Object.keys(data[0]).length > 0) {
      return TodoItem.fromObject(data[0])
    }

    return null
  }

  async listByStatus(completed = true) {
    const payload = {
      operation: 'search_by_value',
      schema: this.schema,
      table: this.table,
      search_attribute: 'completed',
      search_value: completed,
      get_attributes: ['*']
    }

    const response = await fetch(this.url, {
      method: 'POST',
      headers: this.#defaultHeaders,
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(response.statusText)
    }

    const data = (await response.json()) as TodoObjectType[]
    return data.map((todoObject) => TodoItem.fromObject(todoObject))
  }
}

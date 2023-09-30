import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { TodoItemService } from '../services/TodoItemService.js'
import { zValidator } from '@hono/zod-validator'
import {
  TodoObjectCreationSchema,
  TodoObjectCreationType,
  TodoObjectUpdateSchema,
  TodoObjectUpdateType
} from '../domain/TodoItem.js'
import { ZodError } from 'zod'

export async function restAPIFactory(service: TodoItemService) {
  const app = new Hono().basePath('/api')

  app.use('*', logger())
  app.get('/todos', async (c) => {
    try {
      let data

      if (c.req.query('completed')) {
        data = await service.findCompleted()
      } else if (c.req.query('pending')) {
        data = await service.findPending()
      } else {
        data = await service.findAll()
      }
      return c.json(data.map((todo) => todo.toObject()))
    } catch (err) {
      console.error(err)
      c.status(500)
      return c.json({ error: err })
    }
  })

  app.get('/todos/:id', async (c) => {
    try {
      const todo = await service.findOne(c.req.param('id'))
      if (!todo) {
        c.status(404)
        return c.json({ error: 'Todo not found' })
      }
      return c.json(todo.toObject())
    } catch (err) {
      c.status(500)
      return c.json({ error: err })
    }
  })

  app.post('/todos', zValidator('json', TodoObjectCreationSchema), async (c) => {
    try {
      const todoItemObject = await c.req.json<TodoObjectCreationType>()
      const todo = await service.create(todoItemObject)
      c.status(201)
      return c.json(todo.toObject())
    } catch (err) {
      c.status(500)
      return c.json({ error: err })
    }
  })

  app.put('/todos/:id', zValidator('json', TodoObjectUpdateSchema), async (c) => {
    try {
      const todoItemObject = await c.req.json<TodoObjectUpdateType>()
      const todo = await service.update({ ...todoItemObject, id: c.req.param('id') })
      c.status(200)
      return c.json(todo.toObject())
    } catch (err) {
      c.status(500)
      return c.json({ error: err })
    }
  })

  app.delete('/todos/:id', async (c) => {
    try {
      await service.delete(c.req.param('id'))
      c.status(204)
      return c.body(null)
    } catch (err) {
      console.log(err)
      c.status(500)
      return c.json({ error: err })
    }
  })

  return app
}

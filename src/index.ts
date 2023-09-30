import { z } from 'zod'
import { TodoItemClient } from './data/TodoItemClient.js'
import { TodoItemService } from './services/TodoItemService.js'
import { restAPIFactory } from './presentation/api.js'
import { serve } from '@hono/node-server'
const conf = {
  host: process.env.HDB_HOST,
  credentials: {
    username: process.env.HDB_USERNAME,
    password: process.env.HDB_PASSWORD
  },
  schema: process.env.HDB_SCHEMA,
  table: process.env.HDB_TABLE
}

const EnvironmentSchema = z.object({
  host: z.string(),
  credentials: z.object({
    username: z.string(),
    password: z.string()
  }),
  schema: z.string(),
  table: z.string()
})
export type EnvironmentType = z.infer<typeof EnvironmentSchema>

export default async function main() {
  const parsedSchema = EnvironmentSchema.parse(conf)

  const DataLayer = new TodoItemClient(
    parsedSchema.host,
    parsedSchema.schema,
    parsedSchema.table,
    parsedSchema.credentials
  )
  const ServiceLayer = new TodoItemService(DataLayer)
  const app = await restAPIFactory(ServiceLayer)

  serve({ port: 3000, fetch: app.fetch }, console.log).listen(3000)
}

await main()

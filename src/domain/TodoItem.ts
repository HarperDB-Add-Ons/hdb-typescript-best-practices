import { randomUUID } from 'node:crypto'
import { z } from 'zod'

const TodoObjectSchema = z
  .object({
    title: z.string(),
    dueDate: z.date({ coerce: true }),
    id: z.string().uuid().readonly(),
    completed: z.boolean().default(false),
    createdAt: z.date({ coerce: true }).default(new Date()).readonly()
  })
  .strip()

export const TodoObjectCreationSchema = TodoObjectSchema.omit({ id: true, createdAt: true, completed: true }).extend({
  dueDate: z.string().datetime()
})
export const TodoObjectUpdateSchema = TodoObjectSchema.omit({ createdAt: true }).partial().extend({
  dueDate: z.string().datetime().optional()
})

export type TodoObjectType = z.infer<typeof TodoObjectSchema>
export type TodoObjectCreationType = z.infer<typeof TodoObjectCreationSchema>
export type TodoObjectUpdateType = z.infer<typeof TodoObjectUpdateSchema>

export class TodoItem {
  constructor(
    public title: string,
    public dueDate: Date,
    readonly id: string = randomUUID(),
    public completed: boolean = false,
    readonly createdAt: Date = new Date()
  ) {}

  toObject() {
    return {
      title: this.title,
      dueDate: this.dueDate,
      id: this.id,
      completed: this.completed,
      createdAt: this.createdAt
    }
  }

  toJSON() {
    return JSON.stringify(this.toObject())
  }

  static fromObject(todoObject: TodoObjectType): InstanceType<typeof TodoItem> {
    TodoObjectSchema.safeParse(todoObject)
    return new TodoItem(todoObject.title, todoObject.dueDate, todoObject.id, todoObject.completed, todoObject.createdAt)
  }
}

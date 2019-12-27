import { pipe } from 'fp-ts/lib/pipeable'
import { either as E, taskEither as TE } from 'fp-ts'
import { mockData } from 'models'
import { service } from './mockService'

describe('mock task service', () => {
  beforeEach(() => {
    service.resetMocks()
  })

  test('adding/getting task works', async () => {
    const newTask = { ...mockData.tasks[0], id: 'newId' }

    await service.addTask(newTask)()

    await pipe(
      service.getTask(newTask.id),
      TE.map(foundTask => {
        expect(foundTask).toEqual(newTask)
      }),
    )
  })

  test('editing task works', async () => {
    expect.assertions(2)

    const modifiedTask = { ...mockData.tasks[0], name: 'new name' }
    const editedTask = await service.editTask(modifiedTask.id, modifiedTask)()
    expect(E.isRight(editedTask)).toBeTruthy()

    await pipe(
      service.getTask(modifiedTask.id),
      TE.map(foundTask => {
        expect(foundTask).toEqual(modifiedTask)
      }),
    )()
  })

  test('editing nonexistent task returns error', async () => {
    expect.assertions(1)
    await pipe(
      service.editTask('notarealid', mockData.tasks[0]),
      TE.mapLeft(value => {
        expect(value).toEqual({ code: 'TASK_NOT_FOUND' })
      }),
    )()
  })

  test('removing task works', async () => {
    expect.assertions(1)
    const removeId = mockData.tasks[0].id
    service.removeTask(removeId)
    await pipe(
      service.getTask(removeId),
      TE.mapLeft(value => {
        expect(value).toEqual({ code: 'TASK_NOT_FOUND' })
      }),
    )()
  })

  test('getting all tasks works', async () => {
    const newTask = { ...mockData.tasks[0], id: 'newId' }
    await service.addTask(newTask)()

    await pipe(
      service.getAllTasks(),
      TE.map(foundTasks => {
        expect(foundTasks).toEqual([...mockData.tasks, newTask])
      }),
    )
  })
})

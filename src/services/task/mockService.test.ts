import { mockData } from '../../models'
import { service } from './mockService'

describe('mock task service', () => {
  beforeEach(() => {
    service.resetMock()
  })

  test('adding/getting task works', async () => {
    const newTask = { ...mockData.tasks[0], id: 'newId' }
    service.addTask(newTask)
    const foundTask = await service.getTask(newTask.id).run()
    expect(foundTask.isRight()).toBeTruthy()
    expect(foundTask.value).toEqual(newTask)
  })

  test('editing task works', async () => {
    const modifiedTask = { ...mockData.tasks[0], name: 'new name' }
    service.editTask(modifiedTask.id, modifiedTask)
    const foundTask = await service.getTask(modifiedTask.id).run()
    expect(foundTask.isRight()).toBeTruthy()
    expect(foundTask.value).toEqual(modifiedTask)
  })

  test('removing task works', async () => {
    const removeId = mockData.tasks[0].id
    service.removeTask(removeId)
    const foundTask = await service.getTask(removeId).run()
    expect(foundTask.isLeft()).toBeTruthy()
    expect(foundTask.value).toEqual({ code: 'TASK_NOT_FOUND' })
  })

  test('getting all tasks works', async () => {
    const newTask = { ...mockData.tasks[0], id: 'newId' }
    service.addTask(newTask)
    const foundTask = await service.getAllTasks().run()
    expect(foundTask.value).toEqual([...mockData.tasks, newTask])
  })
})

import { disallow } from 'feathers-hooks-common'
import { SaveExcelService, getOptions } from './save-excel.class.js'
import { saveExcelPath, saveExcelMethods } from './save-excel.shared.js'

export * from './save-excel.class.js'

// A configure function that registers the service and its hooks via `app.configure`
export const saveExcel = (app) => {
  // Register our service on the Feathers application
  app.use(saveExcelPath, new SaveExcelService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: saveExcelMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(saveExcelPath).hooks({
    around: {
      all: []
    },
    before: {
      all: [],
      find: [],
      get: [],
      create: [],
      patch: [],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

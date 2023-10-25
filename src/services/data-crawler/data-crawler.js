// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { DataCrawlerService, getOptions } from './data-crawler.class.js'
import { dataCrawlerPath, dataCrawlerMethods } from './data-crawler.shared.js'

export * from './data-crawler.class.js'

// A configure function that registers the service and its hooks via `app.configure`
export const dataCrawler = (app) => {
  // Register our service on the Feathers application
  app.use(dataCrawlerPath, new DataCrawlerService(getOptions(app), app), {
    // A list of all methods this service exposes externally
    methods: dataCrawlerMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(dataCrawlerPath).hooks({
    around: {
      all: [authenticate('jwt')]
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

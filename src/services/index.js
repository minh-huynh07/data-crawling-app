import { saveExcel } from './save-excel/save-excel.js'

import { dataCrawler } from './data-crawler/data-crawler.js'

import { user } from './users/users.js'

export const services = (app) => {
  app.configure(saveExcel)

  app.configure(dataCrawler)

  app.configure(user)

  // All services will be registered here
}

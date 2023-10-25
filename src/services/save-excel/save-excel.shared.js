export const saveExcelPath = 'save-excel'

export const saveExcelMethods = ['create']

export const saveExcelClient = (client) => {
  const connection = client.get('connection')

  client.use(saveExcelPath, connection.service(saveExcelPath), {
    methods: saveExcelMethods
  })
}

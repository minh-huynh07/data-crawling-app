export const dataCrawlerPath = 'data-crawler'

export const dataCrawlerMethods = ['find', 'get', 'create', 'patch', 'remove']

export const dataCrawlerClient = (client) => {
  const connection = client.get('connection')

  client.use(dataCrawlerPath, connection.service(dataCrawlerPath), {
    methods: dataCrawlerMethods
  })
}

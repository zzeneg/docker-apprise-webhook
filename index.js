const http = require('http')
const url = require('url')
const nunjucks = require('nunjucks')
const axios = require('axios').default

const APPRISE_URL = process.env['APPRISE_URL']
if (!APPRISE_URL) { console.error(`APPRISE_URL is not specified`); return }

const env = nunjucks.configure()
env.addFilter('localdate', str => new Date(str).toLocaleString())

const server = http.createServer((request, response) => {
  if (request.method == 'POST') {
    let body = '' 
    request.on('data', data => {
      body += data
    })
    request.on('end', async () => {
      let responseText = `Template is not specified. Request URL ${request.url}`
      let responseCode = 400
      try {
        const query = url.parse(request.url, true).query
        const template = query.template || process.env['TEMPLATE']
        if (template) {
          const key = query.key || process.env['APPRISE_KEY'] || ''
          const appriseUrl = url.resolve(APPRISE_URL, key)
          const message = env.render(template + '.njk', JSON.parse(body))
          const appriseResponse = await axios.post(appriseUrl, {body: message, title: query.title, tag: query.tag, type: query.type})
          responseCode = 200
          responseText = `Sent ${message} to ${appriseUrl} using ${template} with a response ${appriseResponse.status} ${appriseResponse.data}`
        }
      } catch (error) {
        responseCode = 500
        responseText = error.response ? `${error.response.status} ${error.response.statusText}` : error.request || error
      }
      response.writeHead(responseCode)
      response.end(responseText + '')
    })
  }
})

const port = 3000
const host = '0.0.0.0'
server.listen(port, host)
console.log(`Listening at http://${host}:${port}`)
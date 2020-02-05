const http = require('http')
const nunjucks = require('nunjucks')
const axios = require('axios').default;

const APPRISE_URL = process.env['APPRISE_URL']

const env = nunjucks.configure();
env.addFilter('localdate', str => new Date(str).toLocaleString());

const server = http.createServer((request, response) => {
  if (request.method == 'POST') {
    var body = '' 
    request.on('data', data => {
      body += data
    })
    request.on('end', () => {
      response.writeHead(200)
      response.end()
      var json = JSON.parse(body)
      var message = env.render('template.njk', json)
      axios.post(APPRISE_URL, {body: message})
        .catch(err => console.error(err.response ? `${error.response.status} ${error.response.statusText}` : error.request || error))
    })
  }
})

const port = 3000
const host = '0.0.0.0'
server.listen(port, host)
console.log(`Listening at http://${host}:${port}`)
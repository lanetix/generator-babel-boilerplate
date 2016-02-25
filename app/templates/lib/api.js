import https from 'https'
export default function API ({ jwt }) {
  const defaults = {
    hostname: 'gateway.lanetix.com',
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'Accept': 'application/json'
    }
  }
  return function request (options, cb) {
    const opts = Object.assign({}, defaults, options)
    const reqBody = opts.body ? JSON.stringify(opts.body) : null
    if (reqBody) {
      opts.headers['Content-Length'] = reqBody.length
      opts.headers['Content-Type'] = 'application/json'
      opts.body = null
    }
    const req = https.request(opts, res => {
      let body = ''
      res.setEncoding('utf8')
      res.on('data', d => body += d)
      res.on('end', () => cb(null, body.length ? JSON.parse(body) : ''))
    })
    req.on('error', cb)
    if (reqBody) req.write(reqBody)
    req.end()
    return req
  }
}

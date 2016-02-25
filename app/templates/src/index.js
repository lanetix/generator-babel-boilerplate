const https = require('https')

export function handler (event, context) {
  const { jwt, contents: { recordId, recordType, toStage } } = event
  const { succeed, fail } = context
  const advancing = {
    third: 0.25,
    forth: 0.50,
    fifth: 0.75,
    sixth: 1.00
  }
  const reqBody = JSON.stringify({ chance_to_win: advancing[toStage] })
  const req = https.request({
    method: 'PATCH',
    hostname: 'gateway.lanetix.com',
    path: `/v1/records/${recordType}/${recordId}`,
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Content-Length': reqBody.length
    }
  }, res => {
    let body = ''
    res.setEncoding('utf8')
    res.on('data', d => body += d)
    res.on('end', () => succeed(body.length ? JSON.parse(body) : null))
  })

  req.on('error', fail)
  req.write(reqBody)
  req.end()
}

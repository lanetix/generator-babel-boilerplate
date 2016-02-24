const request = require('http-as-promised').defaults({
  json: true,
  resolve: 'body'
})

export function handler (event, context) {
  const { jwt, contents: { recordId, recordType, toStage } } = event
  const { succeed, fail } = context
  const advancing = {
    third: 0.25,
    forth: 0.50,
    fifth: 0.75,
    sixth: 1.00
  }
  request.patch(`https://gateway.lanetix.com/v1/records/${recordType}/${recordId}`, {
    auth: { bearer: jwt },
    body: { chance_to_win: advancing[toStage] }
  }).then(succeed).catch(fail)
}

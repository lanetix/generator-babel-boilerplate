import API from '../lib/api'

export function handler (event, { succeed, fail }) {
  const { contents: { recordId, recordType, toStage } } = event
  const request = API(event)
  const done = (e, res) => e ? fail(e) : succeed(res)
  const chance_to_win = ({
    third: 0.25,
    forth: 0.50,
    fifth: 0.75,
    sixth: 1.00
  })[toStage]

  request({
    method: 'PATCH',
    path: `/v1/records/${recordType}/${recordId}`,
    body: { chance_to_win }
  }, done)
}

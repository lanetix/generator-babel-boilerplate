export function handler(event, context) {
  if ((event.record.capacity < 30) && (event.changeSet.capacity > 30)) {
    context.succeed([{
      to: 'management@acme.com',
      subject: `Duck depot capacity expanded!`,
      body: 'The duck depot can now handle' + event.changeSet.capacity
    }]);
  } else if ((event.record.capacity > 10) && (event.changeSet.capacity < 10)) {
    context.succeed([{
      to: 'management@acme.com',
      subject: `Duck depot capacity critically low!`,
      body: 'The duck depot can now handle' + event.changeSet.capacity
    }]);
  } else {
    context.fail();
  }
}

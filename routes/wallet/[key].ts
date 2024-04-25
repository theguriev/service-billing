export default eventHandler(event => getBallance(getRouterParam(event, 'key')!))

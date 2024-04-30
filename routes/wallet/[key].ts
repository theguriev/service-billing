export default eventHandler(async (event) => {
  const ballanceObject = await getBallance(getRouterParam(event, 'key')!)
  return ballanceObject.ballanceBySymbol
})

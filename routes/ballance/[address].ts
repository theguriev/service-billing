export default eventHandler(async (event) => {
  const ballanceObject = await getBallance(getRouterParam(event, 'address')!)
  return ballanceObject.ballanceBySymbol
})

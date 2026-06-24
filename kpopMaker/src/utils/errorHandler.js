export const handleFetchError = async (response, t) => {
  if (response.ok) return null

  let errorCode = 'default'

  try {
    const payload = await response.json()
    if (payload?.errorCode) {
      errorCode = payload.errorCode
    }
  } catch {
    // ignore parsing errors and fall back to the default localized message
  }

  const message = t(`errors.${errorCode}`)
  alert(message)
  throw new Error(message)
}

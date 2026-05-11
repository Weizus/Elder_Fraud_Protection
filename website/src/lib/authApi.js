const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function fetchWithClerkToken(path, getToken, options = {}) {
  const token = getToken ? await getToken() : null
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  })

  return response
}

export async function fetchAuthContext(getToken) {
  return fetchWithClerkToken('/api/auth/context', getToken, {
    method: 'GET',
  })
}

export async function syncUserProfile(getToken, userDetails) {
  return fetchWithClerkToken('/api/users/sync', getToken, {
    method: 'POST',
    body: JSON.stringify(userDetails),
  })
}

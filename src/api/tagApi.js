import http from './httpClient'

const RESOURCE = '/tags'

export async function fetchTags() {
  // GET /tags (public, no auth)
  return http(RESOURCE, { auth: false })
}

export async function fetchTagById(id) {
  // GET /tags/:id (public, no auth)
  return http(`${RESOURCE}/${id}`, { auth: false })
}

export async function createTag(payload) {
  return http(RESOURCE, {
    method: 'POST',
    body: payload,
  })
}

export async function updateTag(id, payload) {
  return http(`${RESOURCE}/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteTag(id) {
  return http(`${RESOURCE}/${id}`, {
    method: 'DELETE',
  })
}

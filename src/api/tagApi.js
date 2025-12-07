import http from './httpClient'

const RESOURCE = '/tags'

export async function fetchTags() {
  return http(RESOURCE)
}

export async function fetchTagById(id) {
  return http(`${RESOURCE}/${id}`)
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

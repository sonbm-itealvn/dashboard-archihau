import http from './httpClient'

const RESOURCE = '/users'

export async function fetchUsers() {
  return http(RESOURCE)
}

export async function fetchUserById(id) {
  return http(`${RESOURCE}/${id}`)
}

export async function createUser(payload) {
  return http(RESOURCE, {
    method: 'POST',
    body: payload,
  })
}

export async function updateUser(id, payload) {
  return http(`${RESOURCE}/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteUser(id) {
  return http(`${RESOURCE}/${id}`, {
    method: 'DELETE',
  })
}

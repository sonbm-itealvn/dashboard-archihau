import http from './httpClient'

const RESOURCE = '/events'

export async function fetchEvents() {
  return http(RESOURCE)
}

export async function fetchEventById(id) {
  return http(`${RESOURCE}/${id}`)
}

export async function createEvent(payload) {
  return http(RESOURCE, {
    method: 'POST',
    body: payload,
  })
}

export async function updateEvent(id, payload) {
  return http(`${RESOURCE}/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteEvent(id) {
  return http(`${RESOURCE}/${id}`, {
    method: 'DELETE',
  })
}

import http from './httpClient'

const RESOURCE = '/media'

export async function fetchMedia() {
  return http(RESOURCE)
}

export async function fetchMediaById(id) {
  return http(`${RESOURCE}/${id}`)
}

export async function uploadMedia(formData) {
  return http(RESOURCE, {
    method: 'POST',
    body: formData,
  })
}

export async function deleteMedia(id) {
  return http(`${RESOURCE}/${id}`, {
    method: 'DELETE',
  })
}

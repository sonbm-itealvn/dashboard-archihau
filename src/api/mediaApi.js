import http from './httpClient'

const RESOURCE = '/uploads'

export async function fetchMedia() {
  return http(RESOURCE)
}

export async function fetchMediaById(id) {
  return http(`${RESOURCE}/${id}`)
}

export async function uploadMedia(formData) {
  // POST /uploads expects multipart/form-data with field "file"
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

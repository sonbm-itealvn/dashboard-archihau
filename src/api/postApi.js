import http from './httpClient'

const RESOURCE = '/posts'

export async function fetchPosts() {
  return http(RESOURCE)
}

export async function fetchPostById(id) {
  return http(`${RESOURCE}/${id}`)
}

export async function createPost(payload) {
  return http(RESOURCE, {
    method: 'POST',
    body: payload,
  })
}

export async function updatePost(id, payload) {
  return http(`${RESOURCE}/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export async function deletePost(id) {
  return http(`${RESOURCE}/${id}`, {
    method: 'DELETE',
  })
}

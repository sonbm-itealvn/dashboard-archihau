import http from './httpClient'

const RESOURCE = '/posts'

const buildQuery = (params = {}) => {
  const search = new URLSearchParams()
  if (Array.isArray(params.category_ids) && params.category_ids.length) {
    search.set('category_ids', params.category_ids.join(','))
  } else if (typeof params.category_ids === 'string' && params.category_ids.trim()) {
    search.set('category_ids', params.category_ids.trim())
  }
  const query = search.toString()
  return query ? `${RESOURCE}?${query}` : RESOURCE
}

export async function fetchPosts(params) {
  return http(buildQuery(params))
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

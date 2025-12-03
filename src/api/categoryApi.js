import http from './httpClient'

const RESOURCE = '/categories'

export async function fetchCategories() {
  return http(RESOURCE)
}

export async function fetchCategoryById(id) {
  return http(`${RESOURCE}/${id}`)
}

export async function createCategory(payload) {
  return http(RESOURCE, {
    method: 'POST',
    body: payload,
  })
}

export async function updateCategory(id, payload) {
  return http(`${RESOURCE}/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteCategory(id) {
  return http(`${RESOURCE}/${id}`, {
    method: 'DELETE',
  })
}

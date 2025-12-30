import http from './httpClient'

const RESOURCE = '/category-groups'

export async function fetchCategoryGroups() {
  return http(RESOURCE)
}

export async function fetchCategoryGroupById(id) {
  return http(`${RESOURCE}/${id}`)
}

export async function createCategoryGroup(payload) {
  return http(RESOURCE, {
    method: 'POST',
    body: payload,
  })
}

export async function updateCategoryGroup(id, payload) {
  return http(`${RESOURCE}/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteCategoryGroup(id) {
  return http(`${RESOURCE}/${id}`, {
    method: 'DELETE',
  })
}

export async function assignCategoriesToGroup(groupId, categoryIds) {
  return http(`${RESOURCE}/${groupId}/assign-categories`, {
    method: 'POST',
    body: { category_ids: categoryIds },
  })
}

export async function removeCategoriesFromGroup(groupId, categoryIds = null) {
  const body = categoryIds && categoryIds.length > 0 
    ? { category_ids: categoryIds } 
    : {}
  return http(`${RESOURCE}/${groupId}/remove-categories`, {
    method: 'POST',
    body,
  })
}


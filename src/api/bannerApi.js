import http from './httpClient'

const RESOURCE = '/banners'

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams()
  if (params.active !== undefined && params.active !== null && params.active !== '') {
    searchParams.set('active', params.active)
  }
  const queryString = searchParams.toString()
  return queryString ? `${RESOURCE}?${queryString}` : RESOURCE
}

export async function fetchBanners(params) {
  return http(buildQuery(params), { auth: false })
}

export async function fetchBannerById(id) {
  return http(`${RESOURCE}/${id}`, { auth: false })
}

export async function createBanner(payload) {
  return http(RESOURCE, {
    method: 'POST',
    body: payload,
  })
}

export async function updateBanner(id, payload) {
  return http(`${RESOURCE}/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteBanner(id) {
  return http(`${RESOURCE}/${id}`, {
    method: 'DELETE',
  })
}


import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/inventory/product/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getProductList = (current, size, params) => {
  return request({
    url: '/api/inventory/product/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getDetail = (id) => {
  return request({
    url: '/api/inventory/product/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/inventory/product/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/inventory/product/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/inventory/product/submit',
    method: 'post',
    data: row
  })
}


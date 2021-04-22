import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/inventory/warehouse/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getWarehouseList = (current, size, params) => {
  return request({
    url: '/api/inventory/warehouse/list',
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
    url: '/api/inventory/warehouse/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/inventory/warehouse/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/inventory/warehouse/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/inventory/warehouse/submit',
    method: 'post',
    data: row
  })
}


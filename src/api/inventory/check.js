import request from '@/router/axios';

export const getCheckList = (checkNomberId) => {
  return request({
    url: '/api/inventory/check/page',
    method: 'get',
    params: {
      checkNomberId
    }
  })
}

export const getDetail = (id) => {
  return request({
    url: '/api/inventory/check/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/inventory/check/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/inventory/check/submit',
    method: 'post',
    data: row
  })
}

export const getCheckUpdate = (row) => {
  return request({
    url: '/api/inventory/check/submit',
    method: 'post',
    data: row
  })
}


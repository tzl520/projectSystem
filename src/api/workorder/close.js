import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/workorder/close/page',
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
    url: '/api/workorder/close/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/workorder/close/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/workorder/close/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/workorder/close/submit',
    method: 'post',
    data: row
  })
}
export const closeSubmit =(id,closeCause) => {
  return request({
    url: '/api/workorder/close/submit1',
    method: 'post',
    params: {
      id,
      closeCause
    }
  })
}

import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/workorder/backe/list',
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
    url: '/api/workorder/backe/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/workorder/backe/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/workorder/backe/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/workorder/backe/submit',
    method: 'post',
    data: row
  })
}
export const sign = (id) => {
  return request({
    url: '/api/workorder/backe/signin',
    method: 'post',
    params: {
      id,
    }
  })
}
export const submitAgain = (row) => {
  return request({
    url: '/api/workorder/backe/submit1',
    method: 'post',
    params: row
  })
}
export const doneworkSub = (row) => {
  return request({
    url: '/api/workorder/finish/returnVisit',
    method: 'post',
    params: row
  })
}

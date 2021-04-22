import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/workorder/returnvisit/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const repsubmit = (row) => {
  return request({
    url: '/api/workorder/replied/repsubmit',
    method: 'post',
    data: row
  })
}
export const getDetail = (id) => {
  return request({
    url: '/api/workorder/returnvisit/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/workorder/returnvisit/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/workorder/returnvisit/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/workorder/returnvisit/submit',
    method: 'post',
    data: row
  })
}

export const getListDoneWork = (current, size, params) => {
  return request({
    url: '/api/workorder/replied/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

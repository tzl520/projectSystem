import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/workorder/finish/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getDetailReplied = (id) => {
  return request({
    url: '/api/workorder/replied/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const getGiveView = (giveId) => {
  return request({
    url: '/api/workorder/replied/view',
    method: 'get',
    params: {
      giveId
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/workorder/replied/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/workorder/replied/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/workorder/replied/submit',
    method: 'post',
    data: row
  })
}


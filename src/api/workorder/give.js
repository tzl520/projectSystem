import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/workorder/give/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
export const getGivePageList = (current, size, params) => {
  return request({
    url: '/api/workorder/give/list',
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
    url: '/api/workorder/give/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/workorder/give/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/workorder/give/submit',
    method: 'post',
    data: row
  })
}
export const creatWorkAdd = (row) => {
  return request({
    url: '/api/workorder/give/ceatework',
    method: 'post',
    data: row
  })
}
export const updateWork = (row) => {
  return request({
    url: '/api/workorder/give/update',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/workorder/give/update',
    method: 'post',
    data: row
  })
}

export const getMyProjectList = () => {
  return request({
    url: '/api/project-manager/project/myList',
    method: 'get'
  })
}

export const commit = (row) => {
  return request({
    url: '/api/workorder/backe/submit1',
    method: 'post',
    params: row
  })
}

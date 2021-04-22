import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectcompletionacceptance/list',
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
    url: '/api/project-manager/projectcompletionacceptance/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectcompletionacceptance/save',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectcompletionacceptance/update',
    method: 'post',
    data: row
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectcompletionacceptance/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

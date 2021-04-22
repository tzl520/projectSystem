import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/project-manager/presupposition/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getPresuppositionList = () => {
  return request({
    url: '/api/project-manager/presupposition/list',
    method: 'get'
  })
}

export const getDetail = (id) => {
  return request({
    url: '/api/project-manager/presupposition/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/presupposition/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/presupposition/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/presupposition/submit',
    method: 'post',
    data: row
  })
}


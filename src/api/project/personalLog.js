import request from '@/router/axios';

export const getPersonalList = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectpersonallog/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getPersonalDetail = (id) => {
  return request({
    url: '/api/project-manager/projectpersonallog/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectpersonallog/save',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectpersonallog/update',
    method: 'post',
    data: row
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectpersonallog/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

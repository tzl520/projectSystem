import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectcost/list',
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
    url: '/api/project-manager/projectcost/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectcost/save',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectcost/update',
    method: 'post',
    data: row
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectcost/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

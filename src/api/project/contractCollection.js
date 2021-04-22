import request from '@/router/axios';

export const getContractCollectionList = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectcontractcollection/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectcontractcollection/save',
    method: 'post',
    data: row
  })
}

export const getDetail = (id) => {
  return request({
    url: '/api/project-manager/projectcontractcollection/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectcontractcollection/update',
    method: 'post',
    data: row
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectcontractcollection/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

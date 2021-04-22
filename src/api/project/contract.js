import request from '@/router/axios';

export const getContractPage = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectcontract/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
export const getContractList = (projectId) => {
  return request({
    url: '/api/project-manager/projectcontract/list',
    method: 'get',
    params: {
      projectId
    }
  })
}

export const getDetail = (id) => {
  return request({
    url: '/api/project-manager/projectcontract/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectcontract/save',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectcontract/update',
    method: 'post',
    data: row
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectcontract/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const contractRelevanceAdd = (row) => {
  return request({
    url: '/api/project-manager/projectcontractrelevance/save',
    method: 'post',
    data: row
  })
}

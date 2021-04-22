import request from '@/router/axios';

export const getContractProgressPage = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectcontractprogress/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getContractProgressList = (projectId) => {
  return request({
    url: '/api/project-manager/projectcontractprogress/list',
    method: 'get',
    params: {
      projectId
    }
  })
}

export const getDetail = (id) => {
  return request({
    url: '/api/project-manager/projectcontractprogress/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectcontractprogress/save',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectcontractprogress/update',
    method: 'post',
    data: row
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectcontractprogress/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

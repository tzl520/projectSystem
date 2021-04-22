import request from '@/router/axios';

export const getEvaluationPage = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectfinancialevaluation/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getList = (projectId) => {
  return request({
    url: '/api/project-manager/projectfinancialevaluation/list',
    method: 'get',
    params: {
      projectId
    }
  })
}

export const getEvaluationDetail = (id) => {
  return request({
    url: '/api/project-manager/projectfinancialevaluation/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectfinancialevaluation/save',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectfinancialevaluation/update',
    method: 'post',
    data: row
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectfinancialevaluation/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

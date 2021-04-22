import request from '@/router/axios';

export const getexpertReviewPage = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectprogrammeexpertreview/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getexpertReviewList = (projectId) => {
  return request({
    url: '/api/project-manager/projectprogrammeexpertreview/list',
    method: 'get',
    params: {
      projectId
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectprogrammeexpertreview/save',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectprogrammeexpertreview/update',
    method: 'post',
    data: row
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectprogrammeexpertreview/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}
export const getExpertDetail = (id) => {
  return request({
    url: '/api/project-manager/projectprogrammeexpertreview/detail',
    method: 'get',
    params: {
      id
    }
  })
}

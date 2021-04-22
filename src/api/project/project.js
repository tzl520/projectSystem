import request from '@/router/axios';

export const getMyProjectList = (current, size, params) => {
  return request({
    url: '/api/project-manager/project/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getProjectDetail = (id) => {
  return request({
    url: '/api/project-manager/project/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (id) => {
  return request({
    url: '/api/project-manager/project/remove',
    method: 'post',
    params: {
      id
    }
  })
}

export const projectApproval = (row) => {
  return request({
    url: '/api/project-manager/project/approval',
    method: 'post',
    data: row
  })
}

export const projectUpdate = (row) => {
  return request({
    url: '/api/project-manager/project/update',
    method: 'post',
    data: row
  })
}


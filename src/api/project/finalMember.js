import request from '@/router/axios';

export const getMemberPage = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectcompletionacceptancepeople/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getMemberList = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectcompletionacceptancepeople/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const addMember = (row) => {
  return request({
    url: '/api/project-manager/projectcompletionacceptancepeople/save',
    method: 'post',
    data: row
  })
}

export const updateMember = (row) => {
  return request({
    url: '/api/project-manager/projectcompletionacceptancepeople/update',
    method: 'post',
    data: row
  })
}

export const removeMember = (ids) => {
  return request({
    url: '/api/project-manager/projectcompletionacceptancepeople/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

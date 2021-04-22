import request from '@/router/axios';

export const removeProjectGroupUser = (id) => {
  return request({
    url: '/api/project-manager/projectcoordinationgroup/remove',
    method: 'post',
    params: {
      id
    }
  })
}

export const getProjectGroupUserList = (projectId) => {
  return request({
    url: '/api/project-manager/projectcoordinationgroup/list',
    method: 'get',
    params: {
      projectId
    }
  })
}

export const getProjectGroupLeaderUserList = (projectId) => {
  return request({
    url: '/api/project-manager/projectdatachange/getLeadList',
    method: 'get',
    params: {
      projectId
    }
  })
}

export const addGroupUser = (row) => {
  return request({
    url: '/api/project-manager/projectcoordinationgroup/save',
    method: 'post',
    data: row
  })
}

export const updateGroupUser = (row) => {
  return request({
    url: '/api/project-manager/projectcoordinationgroup/updateLead',
    method: 'post',
    data: row
  })
}

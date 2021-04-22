import request from '@/router/axios';

export const getProjectUnitList = (projectId) => {
  return request({
    url: '/api/project-manager/projectunitinfo/list',
    method: 'get',
    params: {
      projectId
    }
  })
}

export const removeProjectUnit = (id) => {
  return request({
    url: '/api/project-manager/projectunitinfo/remove',
    method: 'post',
    params: {
      id
    }
  })
}

export const addProjectUnit = (row) => {
  return request({
    url: '/api/project-manager/projectunitinfo/save',
    method: 'post',
    data: row
  })
}

export const updateProjectUnit = (row) => {
  return request({
    url: '/api/project-manager/projectunitinfo/update',
    method: 'post',
    data: row
  })
}

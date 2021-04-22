import request from '@/router/axios';

export const getConceptualPage = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectprogramme/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getConceptualList = (projectId) => {
  return request({
    url: '/api/project-manager/projectprogramme/list',
    method: 'get',
    params: {
      projectId
    }
  })
}

export const getProgrammeDetail = (id) => {
  return request({
    url: '/api/project-manager/projectprogramme/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectprogramme/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectprogramme/update',
    method: 'post',
    data: row
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectprogramme/save',
    method: 'post',
    data: row
  })
}

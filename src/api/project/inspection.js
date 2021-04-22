import request from '@/router/axios';

export const getInspectionPage = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectreleaseinspection/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getInspectionDetail = (id) => {
  return request({
    url: '/api/project-manager/projectreleaseinspection/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectreleaseinspection/save',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectreleaseinspection/update',
    method: 'post',
    data: row
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectreleaseinspection/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

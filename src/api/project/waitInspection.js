import request from '@/router/axios';

export const getWaitInspectionPage = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectreleaseinspection/pageOne',
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

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectreleaseinspection/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

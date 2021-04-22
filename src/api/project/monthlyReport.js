import request from '@/router/axios';

export const getMonthlyReport = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectprogressmonth/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getMonthlyDetail = (id) => {
  return request({
    url: '/api/project-manager/projectprogressmonth/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectprogressmonth/save',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectprogressmonth/update',
    method: 'post',
    data: row
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectprogressmonth/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

import request from '@/router/axios';

export const getReportList = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectprogressweek/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getReportDetail = (id) => {
  return request({
    url: '/api/project-manager/projectprogressweek/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectprogressweek/save',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectprogressweek/update',
    method: 'post',
    data: row
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectprogressweek/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

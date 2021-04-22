import request from '@/router/axios';

export const getFeedBackList = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectinspectionfeedback/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getFeedBackDetail = (id) => {
  return request({
    url: '/api/project-manager/projectinspectionfeedback/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const addFeedBack = (row) => {
  return request({
    url: '/api/project-manager/projectinspectionfeedback/save',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectinspectionfeedback/update',
    method: 'post',
    data: row
  })
}

export const removeFeed = (ids) => {
  return request({
    url: '/api/project-manager/projectinspectionfeedback/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

import request from '@/router/axios';

export const getPaymentStatusPage = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectcontractpayment/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getPaymentStatusList = (projectId) => {
  return request({
    url: '/api/project-manager/projectcontractpayment/list',
    method: 'get',
    params: {
      projectId
    }
  })
}

export const getDetail = (id) => {
  return request({
    url: '/api/project-manager/projectcontractpayment/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectcontractpayment/save',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectcontractpayment/update',
    method: 'post',
    data: row
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectcontractpayment/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

import request from '@/router/axios';

export const getCostList = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectfinancialappraisalcost/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectfinancialappraisalcost/save',
    method: 'post',
    data: row
  })
}

export const getCostDetail = (id) => {
  return request({
    url: '/api/project-manager/projectfinancialappraisalcost/detail',
    method: 'get',
    params: {
      id
    }
  })
}

//取消归并合同
export const cancelMerger = (id) => {
  return request({
    url: '/api/project-manager/projectcost/contractDel',
    method: 'post',
    params: {
      id
    }
  })
}

//归并合同
export const mergerContract = (row) => {
  return request({
    url: '/api/project-manager/projectcost/contractSubmit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectfinancialappraisalcost/update',
    method: 'post',
    data: row
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectfinancialappraisalcost/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

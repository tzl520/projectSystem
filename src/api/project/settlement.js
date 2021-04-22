import request from '@/router/axios';
//结算列表
export const getSettleList = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectsettlement/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
export const getSettleView = (id) => {
  return request({
    url: '/api/project-manager/projectsettlement/detail',
    method: 'get',
    params: {
      id
    }
  })
}
export const getSettleEdit = (row) => {
  return request({
    url: '/api/project-manager/projectsettlement/update',
    method: 'post',
    data: row
  })
}
export const getSettleSave = (row) => {
  return request({
    url: '/api/project-manager/projectsettlement/save',
    method: 'post',
    data: row
  })
}

export const getSettleRemove = (ids) => {
  return request({
    url: '/api/project-manager/projectsettlement/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

//决算列表
export const getFinalList = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectfinalcost/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
export const getFinalView = (id) => {
  return request({
    url: '/api/project-manager/projectfinalcost/detail',
    method: 'get',
    params: {
      id
    }
  })
}
export const getFinalSave = (row) => {
  return request({
    url: '/api/project-manager/projectfinalcost/save',
    method: 'post',
    data: row
  })
}
export const getFinalUpdate = (row) => {
  return request({
    url: '/api/project-manager/projectfinalcost/update',
    method: 'post',
    data: row
  })
}
export const getFinalRemove = (ids) => {
  return request({
    url: '/api/project-manager/projectfinalcost/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

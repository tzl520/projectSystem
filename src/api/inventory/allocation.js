import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/inventory/allocation/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getDetail = (id) => {
  return request({
    url: '/api/inventory/allocation/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/inventory/allocation/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/inventory/allocation/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/inventory/allocation/update',
    method: 'post',
    data: row
  })
}

//弹窗新增调拨暂存
export const save = (row) => {
  return request({
    url: '/api/inventory/allocation/save',
    method: 'post',
    data: row
  })
}

//弹窗新增调拨提交
export const submit = (row) => {
  return request({
    url: '/api/inventory/allocation/submit',
    method: 'post',
    data: row
  })
}

//提交
export const submitAllocation = (allocationIds) => {
  return request({
    url: '/api/inventory/allocation/submitAllocation',
    method: 'post',
    params: {
      allocationIds,
    }
  })
}

//调拨审核
export const getDBAudit = (allocationId, auditStatus, auditAdvice) => {
  return request({
    url: '/api/inventory/auditrecords/dbAudit',
    method: 'post',
    params: {
      allocationId,
      auditStatus,
      auditAdvice
    }
  })
}

//调拨审核详情
export const getAuditList = (linkId) => {
  return request({
    url: '/api/inventory/auditrecords/list',
    method: 'get',
    params: {
      linkId
    }
  })
}



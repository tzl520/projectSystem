import request from '@/router/axios';

export const getCKAudit = (id, auditStatus, auditAdvice) => {
  return request({
    url: '/api/inventory/auditrecords/ckAudit',
    method: 'post',
    params: {
      id,
      auditStatus,
      auditAdvice
    }
  })
}

export const getAuditList = (linkId) => {
  return request({
    url: '/api/inventory/auditrecords/list',
    method: 'get',
    params: {
      linkId
    }
  })
}

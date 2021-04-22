import request from '@/router/axios';
export const getProjectSummaryList = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectReport/projectPage',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getProjectNameGetAll = () => {
  return request({
    url: '/api/project-manager/project/getAll',
    method: 'get',
    params: {

    }
  })
}
export const getProjectSummaryOpen = (projectId) => {
  return request({
    url: '/api/project-manager/projectReport/openProject',
    method: 'get',
    params: {
      projectId
    }
  })
}
export const getProjectExcel = (projectId,startTime,endTime) => {
  return request({
    url: '/api/project-manager/projectReport/exportGeneralTable',
    method: 'get',
    params: {
      projectId,
      startTime,
      endTime
    }
  })
}
export const statisticalReportExcel = (projectId,startTime,endTime) => {
  return request({
    url: '/api/project-manager/projectReport/exportOutputValue',
    method: 'get',
    params: {
      projectId,
      startTime,
      endTime
    }
  })
}

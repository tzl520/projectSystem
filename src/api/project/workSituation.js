import request from '@/router/axios';

export const getWorkList = (projectId) => {
  return request({
    url: '/api/project-manager/projectPhase/getWorkList',
    method: 'get',
    params: {
      projectId
    }
  })
}
//导入
export const addImport = (projectId,nodeStage,file) => {
  return request({
    url: '/api/project-manager/projectPhase/import',
    method: 'post',
    data: {
      file,
      projectId,
      nodeStage
    }
  })
}
//节点负责人
export const choicePeopleImport = (ids,userId) => {
  return request({
    url: '/api/project-manager/projectPhase/choicePeople',
    method: 'post',
    params: {
      ids,
      userId,
    }
  })
}
//发布工作的责任人
export const getWorkPeopleList = (projectId) => {
  return request({
    url: '/api/project-manager/projectcoordinationgroup/list',
    method: 'get',
    params: {
      projectId
    }
  })
}
//上传
export const uploadFile = (projectId,file,nodeStage) => {
  return request({
    url: '/api/project-manager/projectPhase/import',
    method: 'post',
    config:{
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    },
    data: {
      projectId,
      file,
      nodeStage
    }
  })
}
//工作情况查询时间
export const getWorkTimeDetail = (id) => {
  return request({
    url: '/api/project-manager/projectworkconditiontime/detail',
    method: 'get',
    params: {
      id
    }
  })
}
//工作情况时间修改
export const getWorkTimeUpdate = (id,projectId,nodeStage,planStartDate,planEndDate,realityStartDate,realityEndDate) => {
  return request({
    url: '/api/project-manager/projectworkconditiontime/submit',
    method: 'post',
    data: {
      id,
      projectId,
      nodeStage,
      planStartDate,
      planEndDate,
      realityStartDate,
      realityEndDate
    }
  })
}

import request from '@/router/axios';

export const getAllUserList = () => {
  return request({
    url: '/api/project-manager/project/common/getUserList',
    method: 'get'
  })
}

export const getUserNameList = () => {
  return request({
    url: '/api/project-manager/project/common/userNameList',
    method: 'get'
  })
}

export const getUserUrging = () => {
  return request({
    url: '/api/blade-system/dict-biz/dictionary?code=reminder_way',
    method: 'get'
  })
}
export const getStageNameList = () => {
  return request({
    url: '/api/blade-system/dict-biz/dictionary?code=stage',
    method: 'get'
  })
}

export const attachDel = (ids) => {
  return request({
    url: '/api/blade-resource/attach/remove',
    method: 'post',
    data:{
      ids
    }
  })
}

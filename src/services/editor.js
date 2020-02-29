/*
 * @Author: your name
 * @Date: 2020-02-16 16:01:29
 * @LastEditTime: 2020-02-29 21:36:30
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \ant-design\src\services\editor.js
 */
import request from '@/utils/request';

export async function querySubTypeList() {
  return request('http://localhost:3000/api/site/package/type/list');
}

export async function queryCommonList(subType) {
  return request(`http://localhost:3000/api/site/package/common?subType=${subType}`);
}

export async function queryPackageDetail(packageId) {
  return request(`http://localhost:3000/api/site/package/common/detail?pkgId=${packageId}`);
}

export async function queryPageList(siteId) {
  return request(`http://localhost:3000/api/site/${siteId}`);
}

export async function updatePage(params) {
  return request(`http://localhost:3000/api/site/${params.siteId}`, {
    method: 'PUT',
    data: params,
  });
}

export async function updatePageComponent(params) {
  return request(
    `http://localhost:3000/api/site/${params.siteId}/${params.pageId}/component/update`,
    {
      method: 'POST',
      data: params,
    },
  );
}

export async function fetchRenderHtml(params) {
  return request(`http://localhost:3000/api/render`, {
    method: 'POST',
    data: params,
  });
}

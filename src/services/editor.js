/*
 * @Author: your name
 * @Date: 2020-02-16 16:01:29
 * @LastEditTime: 2020-02-21 20:03:40
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

export async function removeSitePage(pageId) {
  return request(`http://localhost:3000/api/site/page/remove`, {
    method: 'POST',
    data: {
      pageId,
    },
  });
}

export async function updateHomePage(params) {
  return request(`http://localhost:3000/api/site/page/default/update`, {
    method: 'POST',
    data: params,
  });
}

export async function updateSitePage(params) {
  return request(`http://localhost:3000/api/site/${params.siteId}`, {
    method: 'PUT',
    data: params,
  });
}

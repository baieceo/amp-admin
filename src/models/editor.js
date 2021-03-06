/*
 * @Author: your name
 * @Date: 2020-02-16 14:07:47
 * @LastEditTime: 2020-03-03 18:43:44
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \ant-design\src\models\editor.js
 */
import {
  querySubTypeList,
  queryCommonList,
  queryPackageDetail,
  queryPageList,
  updatePage,
  updatePageComponent,
  fetchRenderHtml,
} from '@/services/editor';
import maxBy from 'lodash/maxBy';

const EditorModel = {
  namespace: 'editor',
  state: {
    // view: 'schema',  // resource/schema/page
    // packageId: 'PK154028370486768500440581916343',
    // view: 'resource',
    view: 'page',
    packageId: '',
    packageDetail: {},
    renderHost: 'http://render.baie.net.cn',

    // html 代码片段
    html: '',

    // 左侧面板数据
    panel: {
      visible: true,
      height: document.body.clientHeight - 270,
    },

    // 站点 ID
    siteId: Infinity,
    // 站点全量数据
    siteData: {},

    // 选中页面在siteData.page中索引
    pageId: Infinity,
    // 页面标题
    pageTitle: '',
    // 页面地址
    pageUrl: '',

    subTypeList: [],
    commonList: [],
    componentList: [],

    window: {
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    },
  },
  effects: {
    // 获取站点数据
    *fetchSiteData({ payload }, { call, put }) {
      const response = yield call(queryPageList, payload);

      yield put({
        type: 'saveSiteData',
        payload: response,
      });

      return response;
    },
    // 修改首页
    *changeHomePage({ payload }, { put, select }) {
      const siteData = yield select(state => ({
        ...state.editor,
        page: state.editor.siteData.page.map(item => {
          const page = { ...item };

          page.isHomePage = page.id === payload;

          return page;
        }),
      }));

      yield put({
        type: 'saveSiteData',
        payload: siteData,
      });
    },
    // 修改页面标题
    *changePageTitle({ payload }, { put, select }) {
      const siteData = yield select(state => ({
        ...state.editor,
        page: state.editor.siteData.page.map(item => {
          const page = { ...item };

          if (page.id === payload.pageId) {
            page.title = payload.title;
          }

          return page;
        }),
      }));

      yield put({
        type: 'saveSiteData',
        payload: siteData,
      });
    },
    // 修改页面路径
    *changePageName({ payload }, { put, select }) {
      const siteData = yield select(state => ({
        ...state.editor,
        page: state.editor.siteData.page.map(item => {
          const page = { ...item };

          if (page.id === payload.pageId) {
            page.name = payload.name;
            page.url = `${state.editor.renderHost}/${state.editor.siteId}/${payload.name}`;
          }

          return page;
        }),
      }));

      yield put({
        type: 'saveSiteData',
        payload: siteData,
      });
    },
    // 移除页面
    *removePage({ payload }, { put, call, select }) {
      const pageData = yield select(state => ({
        siteId: state.editor.siteId,
        data: {
          page: state.editor.siteData.page.map(item => {
            const page = { ...item };

            page.isDeleted = page.id === payload;

            return page;
          }),
        },
      }));

      const response = yield call(updatePage, pageData);

      yield put({
        type: 'saveSiteData',
        payload: response,
      });
    },
    // 新增页面
    *addPage(_, { put, call, select }) {
      const pageData = yield select(state => {
        const { renderHost, siteId } = state.editor;
        const page = [...state.editor.siteData.page];

        const target = maxBy(page, o => o.pageOrder);
        const pageOrder = target ? target.pageOrder : 0;
        const name = `${+new Date()}.html`;

        page.push({
          componentList: [],
          isHomePage: false,
          meta: {},
          name,
          pageOrder: pageOrder + 1,
          schemaData: [],
          siteId,
          snapshot: '',
          templatePath: 'pages/detail/index.html',
          url: `${renderHost}/${siteId}/${name}`,
          title: '新建页面',
        });

        return {
          siteId,
          data: {
            page,
          },
        };
      });

      const response = yield call(updatePage, pageData);

      yield put({
        type: 'saveSiteData',
        payload: response,
      });
    },
    // 更新页面
    *updatePage(_, { put, call, select }) {
      const pageData = yield select(state => ({
        siteId: state.editor.siteId,
        data: {
          page: state.editor.siteData.page,
        },
      }));

      const response = yield call(updatePage, pageData);

      yield put({
        type: 'saveSiteData',
        payload: response,
      });
    },
    // 获取渲染 HTML
    *fetchRenderHtml(_, { call, put, select }) {
      const params = yield select(state => ({
        previewData: {
          siteId: state.editor.siteId,
          pageId: state.editor.pageId,
          componentList: state.editor.componentList,
          data: [],
        },
      }));

      const resource = yield call(fetchRenderHtml, params);

      yield put({
        type: 'saveHtml',
        payload: resource.html,
      });
    },
    // 修改页面 ID，计算 pageTitle, pageUrl
    *changePageId({ payload }, { select, put }) {
      const result = yield select(state => state.editor.siteData.page.find(i => i.id === payload));

      if (result) {
        yield put({
          type: 'savePageId',
          payload,
        });

        yield put({
          type: 'savePageTitle',
          payload: result.title,
        });

        yield put({
          type: 'savePageUrl',
          payload: result.url,
        });
      }
    },

    *fetchTypeList(_, { call, put }) {
      const response = yield call(querySubTypeList);
      yield put({
        type: 'saveSubTypeList',
        payload: response,
      });
    },

    *fetchCommonList({ payload }, { call, put }) {
      const response = yield call(queryCommonList, payload);
      yield put({
        type: 'saveCommonList',
        payload: response,
      });
    },

    *fetchPackageDetail({ payload }, { call, put }) {
      const response = yield call(queryPackageDetail, payload);

      if (response && response.papilioPackage && response.papilioPackage.schemas) {
        const { schemas } = response.papilioPackage;

        Object.entries(schemas).forEach(([key, item]) => {
          schemas[key].key = item.name + Math.random();

          if (schemas[key].json.type === 'array') {
            schemas[key].data.forEach((i, n) => {
              schemas[key].data[n].key = n;
            });
          }
        });
      }

      yield put({
        type: 'savePackageDetail',
        payload: response,
      });
    },

    *addComment({ payload }, { call, put, select }) {
      const componentList = yield select(state => state.editor.componentList);
      const { pageId, siteId } = yield select(state => state.editor);

      componentList.push(payload);

      yield put({
        type: 'saveComponentList',
        payload: componentList,
      });

      const params = {
        pageId,
        siteId,
        componentList,
        data: [],
      };

      yield call(updatePageComponent, params);
    },
  },
  reducers: {
    // 存储站点 ID
    saveSiteId(state, action) {
      return { ...state, siteId: action.payload };
    },
    // 存储站点数据
    saveSiteData(state, action) {
      return { ...state, siteData: action.payload };
    },
    // 存储页面 ID
    savePageId(state, action) {
      return { ...state, pageId: action.payload };
    },
    // 存储面板是否可见
    savePanelVisible(state, { payload: value }) {
      return {
        ...state,
        panel: {
          ...state.panel,
          visible: value,
        },
      };
    },
    // 存储 html 代码片段
    saveHtml(state, action) {
      return { ...state, html: action.payload || '' };
    },
    // 存储窗口尺寸
    saveWindowSize(state, action) {
      return {
        ...state,
        window: { ...state.window, ...action.payload },
        panel: { ...state.panel, height: action.payload.height - 270 },
      };
    },
    // 存储页面标题
    savePageTitle(state, action) {
      return { ...state, pageTitle: action.payload || '' };
    },
    // 存储页面 url
    savePageUrl(state, action) {
      return { ...state, pageUrl: action.payload || '' };
    },

    saveSubTypeList(state, action) {
      return { ...state, subTypeList: action.payload || [] };
    },

    saveCommonList(state, action) {
      return { ...state, commonList: action.payload || [] };
    },

    changeSchemaView(state, action) {
      return { ...state, ...action.payload };
    },

    savePackageDetail(state, action) {
      return { ...state, packageDetail: action.payload || {} };
    },

    saveComponentList(state, action) {
      return { ...state, componentList: action.payload || [] };
    },
  },
};

export default EditorModel;

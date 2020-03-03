import { message, Spin, Button } from 'antd';
import React, { useEffect } from 'react';
import { connect, useParams } from 'dva';

import { ReloadOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import { debounce } from '@/utils/utils';
import styles from './index.less';
import PageView from './components/PageView';
import ResourceView from './components/ResourceView';
import SchemaView from './components/SchemaView';

const ButtonGroup = Button.Group;

const send2sandbox = (action, payload) => {
  window.frames.sandbox.postMessage(
    {
      action,
      payload,
    },
    '*',
  );
};

const Panel = props => {
  const { panel, view, siteId, onResourceSelect } = props;

  if (!panel.visible || siteId === Infinity) {
    return null;
  }

  if (view === 'page') {
    return <PageView />;
  }

  if (view === 'resource') {
    return <ResourceView onSelect={onResourceSelect} />;
  }

  if (view === 'schema') {
    return <SchemaView />;
  }

  return null;
};

const Preview = props => {
  const { pageUrl } = props;

  return (
    <>
      <div className={styles.pagePathContainer}>
        <div className={styles.pagePath}>
          <div className={styles.pagePathUrl}>
            <span>{pageUrl}</span>
          </div>
          <div className={styles.pagePathAction}>
            <ReloadOutlined />
          </div>
        </div>
      </div>
      <div className={styles.previewBox}>
        <div className={styles.previewIframe}>
          <div className={styles.previewScroll}>
            <Spin tip="loading..." spinning={false}>
              <iframe
                name="sandbox"
                title="sanbox"
                src="http://localhost:3000/sandbox"
                frameBorder="0"
                scrolling="no"
                style={{ height: '100%', width: '100%', display: 'block' }}
              />
            </Spin>
          </div>
        </div>
      </div>
    </>
  );
};

const EditorView = props => {
  const { siteId } = useParams();
  const { editor, dispatch } = props;
  const { panel, view, html, pageId, pageTitle } = editor;
  const debounceInterval = 500;

  function handleWindowResize() {
    if (dispatch) {
      dispatch({
        type: 'editor/saveWindowSize',
        payload: {
          width: document.body.clientWidth,
          height: document.body.clientHeight,
        },
      });
    }
  }

  async function receiveSandboxMessage(e) {
    const { action, payload } = e.data;

    if (action === 'view-resource') {
      dispatch({
        type: 'editor/savePanelVisible',
        payload: true,
      });

      dispatch({
        type: 'editor/changeSchemaView',
        payload: {
          view: 'resource',
        },
      });
    }

    if (action === 'view-schema') {
      dispatch({
        type: 'editor/savePanelVisible',
        payload: true,
      });

      if (payload.packageId) {
        await dispatch({
          type: 'editor/fetchPackageDetail',
          payload: payload.packageId,
        });

        dispatch({
          type: 'editor/changeSchemaView',
          payload: {
            view: 'schema',
            uid: payload.uid,
            packageId: payload.packageId,
          },
        });
      }
    }

    // iframe 加载完成渲染页面
    if (action === 'render-loaded') {
      send2sandbox('mount');
    }
  }

  // 修改站点 ID
  function changeSiteId(value) {
    if (dispatch) {
      dispatch({
        type: 'editor/saveSiteId',
        payload: value,
      });
    }
  }

  function handleTogglePagePanel() {
    if (dispatch) {
      dispatch({
        type: 'editor/changeSchemaView',
        payload: {
          view: 'page',
        },
      });

      if (view !== 'page') {
        dispatch({
          type: 'editor/savePanelVisible',
          payload: true,
        });
      } else {
        dispatch({
          type: 'editor/savePanelVisible',
          payload: !panel.visible,
        });
      }
    }
  }

  function handlePageChange() {
    if (dispatch) {
      dispatch({
        type: 'editor/fetchRenderHtml',
      });
    }
  }

  async function handleResourceSelect(e) {
    if (dispatch) {
      await dispatch({
        type: 'editor/addComment',
        payload: e,
      });

      dispatch({
        type: 'editor/fetchRenderHtml',
      });
    }
  }

  function handleUpdatePage() {
    return dispatch({
      type: 'editor/updatePage',
    });
  }

  // 页面初始化
  useEffect(() => {
    changeSiteId(Number(siteId));

    window.addEventListener('resize', handleWindowResize, false);
    window.addEventListener('message', receiveSandboxMessage, false);

    return () => {
      window.removeEventListener('resize', handleWindowResize, false);
      window.removeEventListener('message', receiveSandboxMessage, false);
    };
  }, []);

  // html 改变重新渲染页面
  useEffect(() => {
    if (html) {
      send2sandbox('render', html);
    }
  }, [html]);

  // 页面 ID 改变重新获取页面
  useEffect(() => {
    if (dispatch && pageId !== Infinity) {
      debounce(() => {
        dispatch({
          type: 'editor/fetchRenderHtml',
        });
      }, debounceInterval)();
    }
  }, [pageId]);

  return (
    <GridContent>
      <div className={styles.layout}>
        <div className={styles.header}>
          <div className={styles.headerNav}>
            <div className={styles.headerNavTitle}>
              <Button type="link" onClick={() => handleTogglePagePanel()}>
                <UnorderedListOutlined />
                {pageTitle}
              </Button>
            </div>
          </div>
          <div className={styles.headerAction}>
            <ButtonGroup>
              <Button
                onClick={async () => {
                  await handleUpdatePage();

                  message.success('保存成功');
                }}
              >
                保存
              </Button>
              <Button type="primary">发布</Button>
            </ButtonGroup>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.panel}>
            <Panel
              {...editor}
              onPageChange={handlePageChange}
              onResourceSelect={handleResourceSelect}
            />
          </div>
          <div className={styles.preview}>
            <Preview {...editor} onPageChange={handlePageChange} />
          </div>
        </div>
      </div>
    </GridContent>
  );
};

export default connect(({ editor }) => ({
  editor,
}))(EditorView);

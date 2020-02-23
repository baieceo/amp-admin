import { Spin, Button } from 'antd';
import React, { useEffect } from 'react';
import { connect } from 'dva';

import { ReloadOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-layout';
import styles from './index.less';
import PageView from './components/PageView';
import ResourceView from './components/ResourceView';
import SchemaView from './components/SchemaView';

const ButtonGroup = Button.Group;

const send = (action, payload) => {
  window.frames.sandbox.postMessage(
    {
      action,
      payload,
    },
    '*',
  );
};

const Panel = props => {
  const { panel, view, siteId, onPageChange, onResourceSelect } = props;

  if (!panel.visible || siteId === -1) {
    return null;
  }

  if (view === 'page') {
    return <PageView onPageChange={onPageChange} />;
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
  // console.log(props);
  const { pageData, onPageChange } = props;

  return (
    <>
      <div className={styles.pagePathContainer}>
        <div className={styles.pagePath}>
          <div className={styles.pagePathUrl}>
            <span>{pageData.url}</span>
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
                onLoad={() => onPageChange(props)}
                style={{ height: '300px', width: '100%', display: 'block' }}
              />
            </Spin>
          </div>
        </div>
      </div>
    </>
  );
};

const EditorView = props => {
  const { editor, dispatch, match } = props;

  function handleWindowResize() {
    if (dispatch) {
      dispatch({
        type: 'editor/changeWindowResize',
        payload: {
          width: document.body.clientWidth,
          height: document.body.clientHeight,
        },
      });
    }
  }

  function receivePostMessage(e) {
    if (e.data.action === 'view-resource') {
      dispatch({
        type: 'editor/changeSchemaView',
        payload: {
          view: 'resource',
        },
      });
    }
  }

  function changeNoticeSiteId(value) {
    if (dispatch) {
      dispatch({
        type: 'editor/changeNoticeSiteId',
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

      if (editor.view !== 'page') {
        dispatch({
          type: 'editor/changePanelVisible',
          payload: true,
        });
      } else {
        dispatch({
          type: 'editor/changePanelVisible',
          payload: !editor.panel.visible,
        });
      }
    }
  }

  function handlePageChange() {
    send('render', {
      previewData: {
        componentList: [],
        data: [],
        env: 'EDITOR',
        pageId: editor.pageId,
        siteId: editor.siteId,
        templatePath: 'pages/index/index.html',
      },
    });
  }

  function handleResourceSelect(e) {
    console.log(123123, e);
    if (dispatch) {
      dispatch({
        type: 'editor/addComment',
        payload: e,
      });
    }
  }

  useEffect(() => {
    changeNoticeSiteId(Number(match.params.siteId));

    window.addEventListener('resize', handleWindowResize, false);
    window.addEventListener('message', receivePostMessage, false);

    return () => {
      window.removeEventListener('resize', handleWindowResize, false);
      window.removeEventListener('message', receivePostMessage, false);
    };
  }, []);

  return (
    <GridContent>
      <div className={styles.layout}>
        <div className={styles.header}>
          <div className={styles.headerNav}>
            <div className={styles.headerNavTitle}>
              <Button type="link" onClick={() => handleTogglePagePanel()}>
                <UnorderedListOutlined />
                {editor.pageData.title}
              </Button>
            </div>
          </div>
          <div className={styles.headerAction}>
            <ButtonGroup>
              <Button>保存</Button>
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

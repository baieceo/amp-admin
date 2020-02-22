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

function handlePageChange(props) {
  window.frames.sandbox.postMessage(
    {
      action: 'render',
      payload: {
        previewData: {
          componentList: [],
          data: [],
          env: 'EDITOR',
          pageId: props.pageId,
          siteId: props.siteId,
          templatePath: 'pages/index/index.html',
        },
      },
    },
    '*',
  );
}

const Panel = props => {
  const { panel, view, siteId } = props;

  if (!panel.visible || siteId === -1) {
    return null;
  }

  if (view === 'page') {
    return <PageView onPageChange={() => handlePageChange(props)} />;
  }

  if (view === 'resource') {
    return <ResourceView />;
  }

  if (view === 'schema') {
    return <SchemaView />;
  }

  return null;
};

const Preview = props => {
  // console.log(props);
  const { pageData } = props;

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
                onLoad={() => handlePageChange(props)}
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
            <Panel {...editor} />
          </div>
          <div className={styles.preview}>
            <Preview {...editor} />
          </div>
        </div>
      </div>
    </GridContent>
  );
};

export default connect(({ editor }) => ({
  editor,
}))(EditorView);

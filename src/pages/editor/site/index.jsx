import { Spin } from 'antd';
import React, { useEffect } from 'react';
import { connect } from 'dva';
import { GridContent } from '@ant-design/pro-layout';
import styles from './index.less';
import PageView from './components/PageView';
import ResourceView from './components/ResourceView';
import SchemaView from './components/SchemaView';

const Panel = props => {
  const { visible, view, siteId } = props;

  if (!visible || siteId === -1) {
    return null;
  }

  if (view === 'page') {
    return <PageView />;
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
  console.log(props);

  return (
    <div className={styles.previewBox}>
      <div className={styles.previewIframe}>
        <div className={styles.previewScroll}>
          <Spin tip="loading..." spinning={false}>
            <iframe
              title="sanbox"
              src="http://localhost:3000/sandbox"
              frameBorder="0"
              style={{ height: '300px', width: '100%', display: 'block' }}
            />
          </Spin>
        </div>
      </div>
    </div>
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

  function changeNoticeSiteId(value) {
    if (dispatch) {
      dispatch({
        type: 'editor/changeNoticeSiteId',
        payload: value,
      });
    }
  }

  useEffect(() => {
    changeNoticeSiteId(Number(match.params.siteId));

    window.addEventListener('resize', handleWindowResize);

    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  return (
    <GridContent>
      <div className={styles.layout}>
        <div className={styles.body}>
          <div className={styles.panel}>
            <Panel visible={editor.panel.visible} view={editor.view} siteId={editor.siteId} />
          </div>
          <div className={styles.preview}>
            <Preview />
          </div>
        </div>
      </div>
    </GridContent>
  );
};

export default connect(({ editor }) => ({
  editor,
}))(EditorView);

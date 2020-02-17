import { Button, Card, Steps, Result, Descriptions } from 'antd';
import React, { useEffect } from 'react';
import { connect } from 'dva';
import { GridContent } from '@ant-design/pro-layout';
import styles from './index.less';
import ResourceView from './components/ResourceView';
import SchemaView from './components/SchemaView';

const Panel = props => {
  const { visible, view } = props;

  if (!visible) {
    return null;
  }

  if (view === 'resource') {
    return <ResourceView />
  }

  if (view === 'schema') {
    return <SchemaView />;
  }

  return null;
};

const EditorView = props => {
  const { editor, dispatch } = props;

  function handleWindowResize () {
    if (dispatch) {
      dispatch({
        type: 'editor/changeWindowResize',
        payload: {
          width: document.body.clientWidth,
          height: document.body.clientHeight,
        }
      })
    }
  }

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);

    return () => window.removeEventListener('resize', handleWindowResize);
  });

  return (
    <GridContent>
      <div className={styles.layout}>
        <div className={styles.body}>
          <div className={styles.panel}>
            <Panel visible={editor.panel.visible} view={editor.view} />
          </div>
          <div className={styles.preview}>右侧</div>
        </div>
      </div>
    </GridContent>
  );
};

export default connect(({ editor }) => ({
  editor,
}))(EditorView);
import apizclient from 'apiz-browser-client';
import meta from './meta';

// 防止被tree shaking
apizclient();
window.meta = meta;

export default apizclient;
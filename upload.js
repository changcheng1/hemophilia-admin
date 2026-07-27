/*
 * @Author: changcheng
 * @LastEditTime: 2025-12-22 10:34:49
 */
import path from 'path';
import { fileURLToPath } from 'url';
import Client from 'ssh2-sftp-client';

// 获取当前文件的目录路径（ES 模块中的 __dirname 替代方案）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 控制台输出颜色
const fontColor = '\x1B[36m%s\x1B[0m';
// 上传地址
const remotePath = '/var/www/hemophilia-admin/';
const serverConfig = {
  host: '8.147.63.4', // 服务器 IP
  port: '22',
  username: 'root',
  password: 'Gouzi135838.',
};

function put(localPath, remotePath) {
  let sftp = new Client();
  sftp
    .connect(serverConfig)
    .then(() => {
      return sftp.uploadDir(localPath, remotePath);
    })
    .then(() => {
      sftp.end();
      console.log(
        fontColor,
        `上传文件成功：upload ${localPath} to ${remotePath}`
      );
    })
    .catch((err) => {
      console.error(fontColor, err.message);
    });
}

const dirName = path.join(`${__dirname}`);
const localPath = `${dirName}/dist`;
put(localPath, remotePath);

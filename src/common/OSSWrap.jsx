import OSS from './OSS.jsx';
import App from './App.jsx';


var OSSWrap = {
    upload: function (namespace, file, options) {
        return App.api('adm/admin/upload_token', {
            'namespace': namespace,
            'fileName': file.name,
            'fileSize': file.size
        }).then(function (cfg) {
            var client = new OSS({
                region: cfg.region,
                accessKeyId: cfg.accessKey,
                accessKeySecret: cfg.accessSecret,
                stsToken: cfg.stsToken,
                bucket: cfg.bucket
            });
            return client.multipartUpload(cfg.key, file, options).then(function () {
                return {'vendor': 'ali', 'bucket': cfg.bucket, 'key': cfg.key, 'url': cfg.url};
            });
        });
    }
};

export default OSSWrap;

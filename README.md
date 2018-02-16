# Disney-SNS

Disney-SNS

**_config_**

```json
config = {
  appid: "",
  secret: "",
  mongodb: "mongodb://",

  port: '',
  appid: '',
  secret: '',
  qmapKey: '',

  qiniu_ak: '',
  qiniu_sk: '',
  qiniu_bucket: ''
}
```

#### 已支持
微信小程序登录 session_key

发送动态

地理位置更新

#### 等待开发
手机号码绑定/注册

个人空间

消息系统

小组系统




### 持续集成

```
docker stop disney-sns \
&& docker rm disney-sns \
&& cd /data/jenkins/workspace/disney-sns \
&& docker build -t disney-sns . \
&& docker run -d --name disney-sns \
-e TZ='Asia/Shanghai' \
-p 17201:17201 \
--mount type=bind,source=/data/config/disney-sns,target=/app/config \
disney-sns node index -f all
```

<template>
  <div class="rtc-container">
    <h1>WebRTC 技术展示</h1>
    
    <!-- 权限提醒区域 -->
    <div class="permission-notice" v-if="showPermissionNotice">
      <h2>🔒 访问摄像头和麦克风需要您的授权</h2>
      <div class="notice-content">
        <p><strong>如果您看到权限请求弹窗，请点击"允许"</strong></p>
        <p>如果遇到权限被拒绝的问题，请按照以下步骤操作：</p>
        <ul class="permission-steps">
          <li><strong>1. 检查浏览器地址栏：</strong>确保使用 HTTPS 协议或 localhost 访问</li>
          <li><strong>2. 重置权限：</strong>点击地址栏左侧的 🔒 图标 → 摄像头/麦克风 → 允许</li>
          <li><strong>3. 刷新页面：</strong>设置权限后刷新页面重试</li>
          <li><strong>4. 检查设备：</strong>确保摄像头和麦克风没有被其他应用占用</li>
        </ul>
        <div class="browser-check">
          <p><strong>当前状态：</strong></p>
          <div class="status-item">
            <span>协议：</span>
            <span :class="isSecureContext ? 'status-ok' : 'status-error'">
              {{ protocol }} {{ isSecureContext ? '✓' : '✗ (需要 HTTPS 或 localhost)' }}
            </span>
          </div>
          <div class="status-item">
            <span>getUserMedia 支持：</span>
            <span :class="supportsGetUserMedia ? 'status-ok' : 'status-error'">
              {{ supportsGetUserMedia ? '✓ 支持' : '✗ 不支持' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>什么是 WebRTC?</h2>
      <p>WebRTC (Web Real-Time Communication) 是一项实时通讯技术，允许网络应用或站点在不借助中间媒介的情况下，建立浏览器之间点对点的连接，实现视频流、音频流或其他任意数据的传输。</p>
    </div>
    
    <div class="section">
      <h2>核心功能演示</h2>
      <div class="demo-container">
        <div class="video-container">
          <div class="local-video-wrapper">
            <h3>本地视频</h3>
            <video ref="localVideo" autoplay muted class="video-element"></video>
            <div class="video-status" v-if="!localStreamActive">
              <p>点击"开启摄像头"按钮开始</p>
            </div>
          </div>
          <div class="remote-video-wrapper" v-if="connectionEstablished">
            <h3>远程视频</h3>
            <video ref="remoteVideo" autoplay class="video-element"></video>
          </div>
        </div>
        
        <div class="controls">
          <button @click="startLocalStream" :disabled="localStreamActive || isLoading">
            {{ isLoading ? '正在获取权限...' : '开启摄像头' }}
          </button>
          <button @click="stopLocalStream" :disabled="!localStreamActive">关闭摄像头</button>
          <button @click="createOffer" :disabled="!localStreamActive || connectionEstablished">创建连接</button>
          <button @click="closeConnection" :disabled="!connectionEstablished">关闭连接</button>
        </div>

        <!-- 错误提示区域 -->
        <div class="error-message" v-if="errorMessage">
          <h3>❌ {{ errorMessage }}</h3>
          <div class="error-solutions">
            <h4>解决方案：</h4>
            <ul>
              <li v-for="solution in errorSolutions" :key="solution">{{ solution }}</li>
            </ul>
            <button @click="retryAccess" class="retry-btn">重试访问</button>
          </div>
        </div>
        
        <div class="connection-info" v-if="sdpExchange">
          <h3>SDP 信息交换 (实际应用中通过信令服务器交换)</h3>
          <div class="sdp-container">
            <div class="sdp-item">
              <h4>本地会话描述 (SDP Offer)</h4>
              <textarea v-model="localSdp" readonly></textarea>
            </div>
            <div class="sdp-item">
              <h4>远程会话描述 (需在另一浏览器中生成并粘贴)</h4>
              <textarea v-model="remoteSdp" placeholder="粘贴远程SDP"></textarea>
              <button @click="setRemoteDescription" :disabled="!remoteSdp">设置远程描述</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2>WebRTC 核心技术</h2>
      <div class="tech-list">
        <div class="tech-item">
          <h3>MediaStream (getUserMedia)</h3>
          <p>获取用户的摄像头和麦克风等媒体输入设备的数据流</p>
        </div>
        <div class="tech-item">
          <h3>RTCPeerConnection</h3>
          <p>在对等体之间建立音频/视频通话的连接</p>
        </div>
        <div class="tech-item">
          <h3>RTCDataChannel</h3>
          <p>在对等体之间建立双向数据通道</p>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2>应用场景</h2>
      <ul class="application-list">
        <li>视频会议</li>
        <li>实时直播</li>
        <li>在线教育</li>
        <li>远程医疗</li>
        <li>游戏多人实时对战</li>
        <li>文件传输</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RTCView',
  data() {
    return {
      localStream: null,
      peerConnection: null,
      localStreamActive: false,
      connectionEstablished: false,
      sdpExchange: false,
      localSdp: '',
      remoteSdp: '',
      isLoading: false,
      errorMessage: '',
      errorSolutions: [],
      showPermissionNotice: true,
      protocol: window.location.protocol,
      isSecureContext: window.isSecureContext,
      supportsGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    }
  },
  mounted() {
    this.checkEnvironment();
  },
  methods: {
    checkEnvironment() {
      // 检查环境是否支持WebRTC
      if (!this.supportsGetUserMedia) {
        this.errorMessage = '您的浏览器不支持 getUserMedia API';
        this.errorSolutions = [
          '请使用现代浏览器（Chrome 53+、Firefox 36+、Safari 11+、Edge 79+）',
          '确保浏览器版本是最新的'
        ];
        return;
      }

      if (!this.isSecureContext) {
        this.errorMessage = '不安全的上下文，无法访问摄像头和麦克风';
        this.errorSolutions = [
          '请使用 HTTPS 协议访问网站',
          '或者在 localhost 环境下测试',
          '在生产环境中必须使用 HTTPS'
        ];
        return;
      }
    },

    async startLocalStream() {
      this.isLoading = true;
      this.errorMessage = '';
      this.errorSolutions = [];
      
      try {
        // 首先检查权限状态
        if (navigator.permissions) {
          try {
            const cameraPermission = await navigator.permissions.query({ name: 'camera' });
            const microphonePermission = await navigator.permissions.query({ name: 'microphone' });
            
            if (cameraPermission.state === 'denied' || microphonePermission.state === 'denied') {
              throw new Error('权限被永久拒绝，请在浏览器设置中重新允许');
            }
          } catch (permissionError) {
            console.log('权限查询不支持，继续尝试获取媒体流');
          }
        }

        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });
        
        const localVideo = this.$refs.localVideo;
        if (localVideo) {
          localVideo.srcObject = this.localStream;
        }
        
        this.localStreamActive = true;
        this.showPermissionNotice = false;
        console.log('成功获取媒体流');
        
      } catch (error) {
        console.error('获取用户媒体失败:', error);
        this.handleMediaError(error);
      } finally {
        this.isLoading = false;
      }
    },

    handleMediaError(error) {
      console.log('Error details:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        this.errorMessage = '摄像头和麦克风访问被拒绝';
        this.errorSolutions = [
          '点击浏览器地址栏左侧的摄像头图标，选择"允许"',
          '刷新页面后重新尝试',
          '检查浏览器设置中的摄像头和麦克风权限',
          '确保没有其他应用正在使用摄像头'
        ];
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        this.errorMessage = '未找到摄像头或麦克风设备';
        this.errorSolutions = [
          '确保设备已连接摄像头和麦克风',
          '检查设备管理器中是否正确识别了设备',
          '尝试重新连接外接摄像头或麦克风'
        ];
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        this.errorMessage = '摄像头或麦克风被其他应用占用';
        this.errorSolutions = [
          '关闭其他正在使用摄像头的应用程序（如QQ、微信、Zoom等）',
          '重启浏览器后重试',
          '检查是否有其他网页标签正在使用摄像头'
        ];
      } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        this.errorMessage = '摄像头配置不支持当前设置';
        this.errorSolutions = [
          '尝试降低视频质量要求',
          '使用默认摄像头设置'
        ];
        // 尝试使用基本配置重新获取
        this.retryWithBasicConstraints();
      } else if (error.name === 'TypeError') {
        this.errorMessage = '浏览器不支持getUserMedia API';
        this.errorSolutions = [
          '请更新到最新版本的浏览器',
          '使用支持WebRTC的现代浏览器'
        ];
      } else {
        this.errorMessage = '获取媒体流失败: ' + error.message;
        this.errorSolutions = [
          '检查网络连接是否正常',
          '刷新页面重试',
          '尝试使用不同的浏览器'
        ];
      }
    },

    async retryWithBasicConstraints() {
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        const localVideo = this.$refs.localVideo;
        if (localVideo) {
          localVideo.srcObject = this.localStream;
        }
        
        this.localStreamActive = true;
        this.errorMessage = '';
        this.errorSolutions = [];
        this.showPermissionNotice = false;
        
      } catch (retryError) {
        console.error('基本配置重试也失败:', retryError);
      }
    },

    retryAccess() {
      this.errorMessage = '';
      this.errorSolutions = [];
      this.startLocalStream();
    },
    
    stopLocalStream() {
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          track.stop();
          console.log('停止轨道:', track.kind);
        });
        this.localStream = null;
        this.localStreamActive = false;
        
        if (this.$refs.localVideo) {
          this.$refs.localVideo.srcObject = null;
        }
      }
    },
    
    async createOffer() {
      try {
        this.peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        });
        
        // 添加本地流到连接
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream);
        });
        
        // 监听远程流
        this.peerConnection.ontrack = (event) => {
          console.log('收到远程流:', event.streams[0]);
          if (this.$refs.remoteVideo) {
            this.$refs.remoteVideo.srcObject = event.streams[0];
          }
        };
        
        // 监听连接状态
        this.peerConnection.onconnectionstatechange = () => {
          console.log('连接状态:', this.peerConnection.connectionState);
        };
        
        // 创建提议
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        
        // 在实际应用中，这里会将offer发送给信令服务器
        this.localSdp = JSON.stringify(this.peerConnection.localDescription);
        this.sdpExchange = true;
        
      } catch (error) {
        console.error('创建连接失败:', error);
        alert('创建WebRTC连接失败: ' + error.message);
      }
    },
    
    async setRemoteDescription() {
      if (!this.peerConnection) {
        alert('请先创建连接');
        return;
      }
      
      try {
        const remoteDesc = JSON.parse(this.remoteSdp);
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(remoteDesc));
        
        if (remoteDesc.type === 'offer') {
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          this.localSdp = JSON.stringify(this.peerConnection.localDescription);
        }
        
        this.connectionEstablished = true;
      } catch (error) {
        console.error('设置远程描述失败:', error);
        alert('设置远程描述失败: ' + error.message);
      }
    },
    
    closeConnection() {
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
      
      this.connectionEstablished = false;
      this.sdpExchange = false;
      this.localSdp = '';
      this.remoteSdp = '';
      
      if (this.$refs.remoteVideo) {
        this.$refs.remoteVideo.srcObject = null;
      }
    }
  },
  beforeUnmount() {
    this.stopLocalStream();
    this.closeConnection();
  }
}
</script>

<style scoped>
.rtc-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
}

.section {
  margin-bottom: 40px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.permission-notice {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.permission-notice h2 {
  color: white;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.notice-content {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.permission-steps {
  list-style: none;
  padding: 0;
}

.permission-steps li {
  margin: 15px 0;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  border-left: 4px solid #ffd700;
}

.browser-check {
  margin-top: 20px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.status-ok {
  color: #2ecc71;
  font-weight: bold;
}

.status-error {
  color: #e74c3c;
  font-weight: bold;
}

.error-message {
  background-color: #ffebee;
  border: 2px solid #f44336;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  color: #c62828;
}

.error-message h3 {
  color: #c62828;
  background: none;
  margin: 0 0 15px 0;
  text-align: left;
}

.error-solutions {
  background-color: white;
  border-radius: 6px;
  padding: 15px;
  margin-top: 15px;
}

.error-solutions h4 {
  color: #1976d2;
  margin: 0 0 10px 0;
}

.error-solutions ul {
  margin: 10px 0;
  padding-left: 20px;
}

.error-solutions li {
  margin: 8px 0;
  color: #424242;
}

.retry-btn {
  background-color: #ff5722;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background-color: #d84315;
}

h2 {
  color: #3498db;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.demo-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.video-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.local-video-wrapper, .remote-video-wrapper {
  flex: 1;
  min-width: 300px;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
}

.video-status {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 8px;
}

h3 {
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  margin: 0;
  padding: 10px;
  text-align: center;
}

.video-element {
  width: 100%;
  height: 300px;
  background-color: #222;
  object-fit: cover;
}

.controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 20px 0;
}

button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
  min-width: 120px;
}

button:hover {
  background-color: #2980b9;
}

button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.connection-info {
  margin-top: 20px;
}

.sdp-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.sdp-item {
  flex: 1;
  min-width: 300px;
}

textarea {
  width: 100%;
  height: 150px;
  border-radius: 4px;
  border: 1px solid #ddd;
  padding: 10px;
  font-family: monospace;
  resize: vertical;
}

.tech-list {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.tech-item {
  flex: 1;
  min-width: 250px;
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.tech-item h3 {
  color: #2c3e50;
  background-color: transparent;
  text-align: left;
}

.application-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  padding: 0;
}

.application-list li {
  background-color: white;
  list-style-type: none;
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-weight: bold;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .video-container, .sdp-container {
    flex-direction: column;
  }
  
  .permission-steps li {
    font-size: 14px;
  }
  
  .status-item {
    flex-direction: column;
    gap: 5px;
  }
}
</style> 
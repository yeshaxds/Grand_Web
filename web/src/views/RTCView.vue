<template>
  <div class="rtc-container">
    <h1>WebRTC 技术展示</h1>
    
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
          </div>
          <div class="remote-video-wrapper" v-if="connectionEstablished">
            <h3>远程视频</h3>
            <video ref="remoteVideo" autoplay class="video-element"></video>
          </div>
        </div>
        
        <div class="controls">
          <button @click="startLocalStream" :disabled="localStreamActive">开启摄像头</button>
          <button @click="stopLocalStream" :disabled="!localStreamActive">关闭摄像头</button>
          <button @click="createOffer" :disabled="!localStreamActive || connectionEstablished">创建连接</button>
          <button @click="closeConnection" :disabled="!connectionEstablished">关闭连接</button>
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
      remoteSdp: ''
    }
  },
  methods: {
    async startLocalStream() {
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
      } catch (error) {
        console.error('获取用户媒体失败:', error);
        alert('无法访问摄像头和麦克风: ' + error.message);
      }
    },
    
    stopLocalStream() {
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
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
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        });
        
        // 添加本地流到连接
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream);
        });
        
        // 监听远程流
        this.peerConnection.ontrack = (event) => {
          if (this.$refs.remoteVideo) {
            this.$refs.remoteVideo.srcObject = event.streams[0];
          }
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
}
</style> 
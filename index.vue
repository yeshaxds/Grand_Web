<template>
  <div class="flex1 flex overflow-hidden please-container">
    <div class="right-sidebar">
      <!-- 当前会诊信息 -->
      <div class="current-consultation">
        <div class="current-header">正在会诊中</div>
        <div class="current-patient" v-if="currentConsultation">
          <div class="patient-name">{{ currentConsultation.patientName }}</div>
          <div class="patient-info">发起人：{{ currentConsultation.requestingDoctorName }}</div>
          <div class="patient-time">{{ formatConsultationTime(currentConsultation.startTime, currentConsultation.endTime) }}</div>
          <div class="patient-link" @click="viewPatientDetail(currentConsultation)">患者档案信息 ></div>
        </div>
        <div class="current-patient" v-else>
          <div class="patient-name">暂无正在进行的会诊</div>
          <div class="patient-info">-</div>
          <div class="patient-time">-</div>
        </div>
      </div>

      <!-- 等待会诊列表 -->
      <div class="waiting-list">
        <div class="waiting-header">
          <span class="waiting-title">等待会诊</span>
          <span class="waiting-count">今日共{{ waitingList.length + (currentConsultation ? 1 : 0) - 1 }}名</span>
        </div>
        
        <div class="waiting-items">
          <div class="waiting-item" v-for="(item, index) in waitingList" :key="index" @click="viewPatientDetail(findConsultationByRecordId(item.recordId))">
            <div class="item-left">
              <div class="patient-name">{{ item.patientName }}</div>
              <div class="initiator">发起人：{{ item.requestingDoctorName }}</div>
              <div class="wait-time">{{ item.status }}</div>
            </div>
            <div class="item-right">
              <i class="el-icon-arrow-right"></i>
            </div>
          </div>
          <div class="view-more" v-if="waitingList.length > 0" @click="activeStatus = 'consultation'">点击查看更多</div>
          <div class="empty-waiting" v-else>暂无等待会诊的患者</div>
        </div>
      </div>

    </div>
    
    <!-- 中间内容区域 -->
    <div class="content-area">
      <!-- 会诊管理内容 -->
      <div v-if="!showPatientDetail && !showCreateConsultation && !showMeetingChat && !showPatientDetailXQ" class="consultation-container">
        <!-- 头部信息 -->
        <div class="header-info">
          <div class="location">当前位置：会诊管理 > 待会诊</div>
          <div class="search-bar">
            <el-input
              v-model="searchQuery"
              placeholder="输入会诊专家姓名或患者姓名"
              style="width: 300px;"
            >
            </el-input>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button type="success" @click="handleAdd">新建会诊</el-button>
          </div>
        </div>

        <!-- 状态标签页 -->
        <div class="status-tabs">
          <div class="tabs-container">
            <div 
              class="tab-item" 
              :class="{ active: activeStatus === 'special' }"
              @click="handleStatusChange({ name: 'special' })"
            >
              待确认 ({{ specialCount || 0 }})
            </div>
            <div 
              class="tab-item" 
              :class="{ active: activeStatus === 'consultation' }"
              @click="handleStatusChange({ name: 'consultation' })"
            >
              待会诊 ({{ consultationCount || 0 }})
            </div>
            <div 
              class="tab-item" 
              :class="{ active: activeStatus === 'completed' }"
              @click="handleStatusChange({ name: 'completed' })"
            >
              已会诊 ({{ completedCount || 0 }})
            </div>
            <div 
              class="tab-item" 
              :class="{ active: activeStatus === 'cancelled' }"
              @click="handleStatusChange({ name: 'cancelled' })"
            >
              已取消 ({{ cancelledCount || 0 }})
            </div>
          </div>
        </div>

        <!-- 日期选择 -->
        <div class="date-filter">
          <span>会诊日期</span>
          <el-date-picker
            v-model="startDate"
            type="date"
            placeholder="开始日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            class="date-input"
          >
          </el-date-picker>
          <span>至</span>
          <el-date-picker
            v-model="endDate"
            type="date"
            placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            class="date-input"
          >
          </el-date-picker>
          <el-button plain @click="handleQuery" class="query-btn">查询</el-button>
        </div>

        <!-- 会诊列表 -->
        <div class="consultation-table">
          <table class="full-width-table">
            <thead>
              <tr>
                <th width="50">序号</th>
                <th width="120">患者</th>
                <th width="120">发起时间</th>
                <th width="80">科室</th>
                <th width="180">会诊医生</th>
                <th width="80">发起人</th>
                <th width="180">会诊时间</th>
                <th width="100">状态</th>
                <th width="80">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in tableData" :key="item.recordId">
                <td>{{ index + 1 }}</td>
                <td>{{ item.patientName }}</td>
                <td>{{ formatDate(item.createdTime) }}</td>
                <td>{{ item.requestingDeptName }}</td>
                <td>{{ getDoctorNames(item) }}</td>
                <td>{{ item.requestingDoctorName }}</td>
                <td>{{ formatConsultationTime(item.startTime, item.endTime) }}</td>
                <td>
                  <span class="status-tag" :class="getStatusClass(item.consultationStatus)">
                    {{ getStatusText(item.consultationStatus) }}
                  </span>
                </td>
                <td>
                  <div class="operation-buttons">
                    <!-- 会诊中状态 -->
                     <template v-if="item.consultationStatus === 4">
                      <button class="join-btn" @click="handleJoinMeeting(item)">进入会议</button>
                      <button class="view-btn" @click="handleView(item)">查看</button>
                      <button v-if="approved === false" class="reject-btn" @click="handleShowRejection(item)">医生已拒绝</button>
                    </template>
                    
                    <!-- 已会诊状态 -->
                    <template v-else-if="item.consultationStatus === 2">
                      <button class="write-btn" @click="handleWriteAdvice(item)">写建议</button>
                      <button v-if="approved === false" class="reject-btn" @click="handleShowRejection(item)">医生已拒绝</button>
                    </template>
                    
                    <!-- 已拒绝状态 -->
                    <template v-else-if="item.consultationStatus === 3">
                      <button class="view-btn" @click="handleView(item)">查看</button>
                      <button v-if="approved === false" class="reject-btn" @click="handleShowRejection(item)">医生已拒绝</button>
                    </template>
                    
                    <!-- 其他状态 -->
                    <button v-else class="view-btn" @click="handleView(item)">查看</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- 分页 -->
          <div class="pagination-container">
            <div class="pagination-info">共{{ total }}条</div>
            <div class="pagination-controls">
              <button class="pagination-btn" @click="prevPage" :disabled="currentPage <= 1">
                <i class="el-icon-arrow-left"></i>
              </button>
              <span class="pagination-current">{{ currentPage }}</span>
              <button class="pagination-btn" @click="nextPage" :disabled="currentPage >= totalPages">
                <i class="el-icon-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- PatientDetail组件视图 -->
      <div v-if="showPatientDetailXQ" class="patient-component-container">
        <div class="detail-header">
          <div class="current-location">当前位置：会诊管理 > 患者详情</div>
          <div class="back-button" @click="showPatientDetailXQ = false">返回上一级</div>
        </div>
        <PatientDetail 
          :patient-info="selectedPatient" 
          @close="showPatientDetailXQ = false"
        />
      </div>
      
      <!-- 患者详情内容 -->
      <div v-if="showPatientDetail && !showCreateConsultation && !showMeetingChat && !showPatientDetailXQ" class="embedded-patient-detail">
        <!-- 患者详情头部 -->
        <div class="detail-header">
          <div class="current-location">当前位置：病案会诊室 > 查看患者档案</div>
          <div class="back-button" @click="closePatientDetail">返回上一级</div>
        </div>
        
        <div class="detail-content">
          <div class="detail-tabs">
            <div class="tab active">基本信息</div>
            <div class="tab">查看法律文件信息</div>
          </div>
          
          <div class="info-section">
            <div class="section-title">基本信息</div>
            <div class="basic-info">
              <div class="info-row">
                <div class="info-item">姓名：{{ patientInfo.name || 'XXX' }}</div>
                <div class="info-item">性别：{{ patientInfo.gender || '男' }}</div>
                <div class="info-item">年龄：{{ patientInfo.age || '23周岁' }}</div>
                <div class="info-item">身高：{{ patientInfo.height || '177cm' }}</div>
                <div class="info-item">体重：{{ patientInfo.weight || '70kg' }}</div>
              </div>
            </div>
          </div>
          
          <div class="info-section">
            <div class="section-title">患者主诉</div>
            <div class="section-content">{{ patientInfo.chiefComplaint || 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' }}</div>
          </div>
          
          <div class="info-section">
            <div class="section-title">体征</div>
            <div class="section-content">{{ patientInfo.physicalSigns || 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' }}</div>
          </div>
          
          <div class="info-section">
            <div class="section-title">临床诊断</div>
            <div class="section-content">{{ patientInfo.clinicalDiagnosis || 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' }}</div>
          </div>
          
          <div class="info-section">
            <div class="section-title">申请诊断目的</div>
            <div class="section-content">{{ patientInfo.consultationPurpose || 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' }}</div>
          </div>
          
          <div class="info-section">
            <div class="section-title">图片上传</div>
            <div class="upload-section">
              <div class="upload-text">共6个文件</div>
              <div class="upload-gallery">
                <div class="image-item" v-for="(img, index) in 3" :key="index">
                  <div class="placeholder-image"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-right-sidebar">
          <div class="right-sidebar-title">远程会诊</div>
          <div class="similar-case-empty" v-if="currentRow && currentRow.consultationStatus !== undefined">
            <!-- 待确认状态 -->
            <div v-if="currentRow.consultationStatus === 0 && !currentRow.approved" class="empty-text">待确认</div>
            
            <!-- 等待会诊状态（待会诊）-->
            <div v-else-if="(currentRow.consultationStatus === 0 && currentRow.approved) || currentRow.consultationStatus === 1" class="waiting-status">
              <div class="wait-time">
                {{ getWaitingTime(currentRow.startTime) }}
              </div>
              <div class="waiting-text">等待会诊中</div>
            </div>
            
            <!-- 会诊中状态 -->
            <div v-else-if="currentRow.consultationStatus === 4" class="in-progress-status" @click="enterMeeting(currentRow)">
              <div class="in-progress-text">正在会诊中</div>
              <div class="enter-meeting">点击进入会议</div>
            </div>
            
            <!-- 已会诊状态 -->
            <div v-else-if="currentRow.consultationStatus === 2" class="completed-status">
              <div class="completed-text">已会诊</div>
              <div class="completed-time">{{ formatDate(currentRow.realEndTime || currentRow.endTime) }}</div>
            </div>
            
            <!-- 已取消状态 -->
            <div v-else-if="currentRow.consultationStatus === 3" class="cancelled-status">
              <div class="cancelled-text">已取消</div>
            </div>
            
            <!-- 默认状态，防止未知状态 -->
            <div v-else class="empty-text">状态未知</div>
          </div>
          <div v-else class="similar-case-empty">
            <div class="empty-text">待确认</div>
          </div>
          
          <div class="doctor-section">
            <div class="doctor-section-title">会诊医生</div>
            <div class="doctor-card">
              <div class="doctor-avatar"></div>
              <div class="doctor-info">
                <div class="doctor-name">张三 主任医师</div>
                <div class="doctor-hospital">武汉XXXXXXXX医院 影像介入科</div>
              </div>
            </div>
            
            <div class="doctor-remarks">
              <div class="remarks-title">描述：</div>
              <div class="remarks-content">XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</div>
            </div>
            
            <div class="consultation-result">
              <div class="result-title">会诊意见</div>
              <div class="result-content">
                <textarea placeholder="会诊结果反馈会被导出家属的诊疗意见" rows="8"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 新建会诊表单 -->
      <div v-if="showCreateConsultation && !showPatientDetail && !showMeetingChat" class="create-consultation-form">
        <!-- 新建会诊头部 -->
        <div class="detail-header">
          <div class="current-location">当前位置：会诊管理 > {{ selectingExperts ? '选择专家' : '新建会诊' }}</div>
          <div class="back-button" @click="closeCreateConsultation">返回上一级</div>
        </div>
        
        <!-- 选择专家界面 -->
        <div v-if="selectingExperts" class="expert-selection">
          <div class="search-section">
            <div class="search-input">
              <input type="text" v-model="expertSearchQuery" placeholder="输入医生姓名或专业">
              <button class="search-btn" @click="searchExperts">查询</button>
            </div>
            <div class="filter-options">
              <div class="filter-item">
                <span class="label">科室</span>
                <select v-model="expertDepartment">
                  <option value="">全部</option>
                  <option value="内科">内科</option>
                  <option value="外科">外科</option>
                  <option value="影像介入科">影像介入科</option>
                </select>
              </div>
              <div class="filter-item">
                <span class="label">查询日期</span>
                <input type="date" v-model="expertAvailableDate">
                <button class="search-btn" @click="searchExperts">查询</button>
              </div>
            </div>
          </div>
          
          <div class="experts-grid">
            <div v-for="(expert, index) in filteredExperts" :key="index" class="expert-card" :class="{ selected: selectedExperts.includes(expert.id) }">
              <div class="expert-info">
                <div class="expert-avatar">
                  <img :src="expert.avatar || 'https://via.placeholder.com/60'" alt="医生头像">
                </div>
                <div class="expert-detail">
                  <div class="expert-name"><span class="expert-title">{{ expert.name }}</span><span class="expert-titles">{{ expert.title }}</span></div>
                  <div class="expert-hospital">{{ expert.hospital }} {{ expert.department }}</div>
                </div>
              </div>
              <div class="expert-description">
                <div class="description-title">擅长</div>
                <div class="description-content">{{ expert.description }}</div>
              </div>
              <div class="selection-action">
                <button 
                  class="select-btn" 
                  :class="{ selected: selectedExperts.includes(expert.id) }"
                  @click="toggleExpertSelection(expert.id)"
                >
                  {{ selectedExperts.includes(expert.id) ? '取消选择' : '确认选择' }}
                </button>
              </div>
            </div>
          </div>
          
          <div class="action-footer">
            <button class="next-step-btn" @click="proceedToConsultationForm" :disabled="selectedExperts.length === 0">下一步</button>
          </div>
        </div>
        
        <!-- 填写会诊信息表单 -->
        <div v-else class="form-content">
          <div class="green-title">患者信息</div>
          
          <div class="basic-info-section">
            <div class="section-title">
              基本信息
              <button class="patient-detail-btn" @click="goToPatientDetail">
                <i class="el-icon-user"></i> 患者详情
              </button>
            </div>
            <div class="basic-info">
              <div class="info-row">
                <div class="info-item">
                  <label>*姓名</label>
                  <div class="search-input-wrapper">
                    <input 
                      type="text" 
                      v-model="consultationForm.patientName" 
                      @input="searchPatients" 
                      placeholder="输入姓名搜索" 
                    />
                    <div class="search-results" v-show="showSearchResults && filteredPatients.length > 0">
                      <div 
                        class="search-result-item" 
                        v-for="patient in filteredPatients" 
                        :key="patient.pkId"
                        @click="selectPatient(patient)"
                      >
                        {{ patient.name }} ({{ patient.age }}岁)
                      </div>
                    </div>
                  </div>
                </div>
                <div class="info-item">
                  <label>性别</label>
                  <div class="gender-selector">
                    <div 
                      class="gender-option" 
                      :class="{ 'selected': consultationForm.gender === '男' }"
                      @click="consultationForm.gender = '男'"
                    >
                      <span class="check-circle" :class="{ 'selected': consultationForm.gender === '男' }">
                        <i class="el-icon-check" v-if="consultationForm.gender === '男'"></i>
                      </span>
                      <span class="gender-text">男</span>
                    </div>
                    <div 
                      class="gender-option" 
                      :class="{ 'selected': consultationForm.gender === '女' }"
                      @click="consultationForm.gender = '女'"
                    >
                      <span class="check-circle" :class="{ 'selected': consultationForm.gender === '女' }">
                        <i class="el-icon-check" v-if="consultationForm.gender === '女'"></i>
                      </span>
                      <span class="gender-text">女</span>
                    </div>
                  </div>
                </div>
                <div class="info-item">
                  <label>婚姻</label>
                  <select v-model="consultationForm.maritalStatus">
                    <option value="">请选择</option>
                    <option value="已婚">已婚</option>
                    <option value="未婚">未婚</option>
                  </select>
                </div>
              </div>
              
              <div class="info-row">
                <div class="info-item">
                  <label>*年龄</label>
                  <input type="number" v-model="consultationForm.age" placeholder="27" />
                  <div class="unit">周岁</div>
                </div>
                <div class="info-item">
                  <label>*联系电话</label>
                  <input type="text" v-model="consultationForm.phone" placeholder="18888888888" />
                </div>
                <div class="info-item">
                  <!-- 空白项，保持布局一致 -->
                </div>
              </div>
            </div>
            
            <div class="section-title">详情信息</div>
            <div class="detail-info">
              <div class="info-row">
                <div class="info-item">
                  <label>证件类型</label>
                  <select v-model="consultationForm.idType">
                    <option value="身份证">身份证</option>
                    <option value="护照">护照</option>
                  </select>
                </div>
                <div class="info-item">
                  <label>出生日期</label>
                  <input type="date" v-model="consultationForm.birthDate" />
                </div>
                <div class="info-item">
                  <label>民族</label>
                  <select v-model="consultationForm.ethnicity">
                    <option value="">请选择</option>
                    <option v-for="nation in nationOptions" :key="nation" :value="nation">{{ nation }}</option>
                  </select>
                </div>
              </div>
              
              <div class="info-row">
                <div class="info-item">
                  <label>证件号码</label>
                  <input type="text" v-model="consultationForm.idNumber" placeholder="输入公民身份证号" />
                </div>
                <div class="info-item">
                  <label>身高</label>
                  <input type="text" v-model="consultationForm.height" placeholder="输入身高" />
                  <span class="unit">CM</span>
                </div>
                <div class="info-item">
                  <label>籍贯</label>
                  <input type="text" v-model="consultationForm.hometown" placeholder="输入籍贯" />
                </div>
              </div>
              
              <div class="info-row">
                <div class="info-item">
                  <label>体重</label>
                  <input type="text" v-model="consultationForm.weight" placeholder="输入体重" />
                  <span class="unit">KG</span>
                </div>
                <div class="info-item">
                  <label>职业</label>
                  <input type="text" v-model="consultationForm.occupation" placeholder="输入职业" />
                </div>
                <div class="info-item">
                  <!-- 空白项，保持布局一致 -->
                </div>
              </div>
            </div>
          </div>
          
          <div class="disease-section">
            <div class="section-title">病历摘要</div>
            
            <div class="text-section">
              <div class="text-title">患者主诉</div>
              <textarea 
                v-model="consultationForm.chiefComplaint" 
                placeholder="此处填写医生描述的主要病情方向的具体内容此处填写医生描述的主要病情方向的具体内容此处填写医生描述的主要病情方向的具体内容此处填写医生描述的主要病情方向的具体内容..."
                rows="4"
              ></textarea>
            </div>
            
            <div class="text-section">
              <div class="text-title">临床诊断</div>
              <textarea 
                v-model="consultationForm.clinicalDiagnosis" 
                placeholder="此处填写医生描述的主要病情方向的具体内容此处填写医生描述的主要病情方向的具体内容此处填写医生描述的主要病情方向的具体内容此处填写医生描述的主要病情方向的具体内容..."
                rows="4"
              ></textarea>
            </div>
            
            <div class="text-section">
              <div class="text-title">体征</div>
              <textarea 
                v-model="consultationForm.physicalSigns" 
                placeholder="此处填写医生描述的主要病情方向的具体内容此处填写医生描述的主要病情方向的具体内容此处填写医生描述的主要病情方向的具体内容此处填写医生描述的主要病情方向的具体内容..."
                rows="4"
              ></textarea>
            </div>
          </div>
          
          <div class="purpose-section">
            <div class="section-title">申请诊断目的(临床医生)</div>
            <textarea 
              v-model="consultationForm.consultationPurpose" 
              placeholder="请输入申请会诊的问题描述..."
              rows="5"
            ></textarea>
          </div>
          
          <div class="upload-section">
            <div class="section-title">文件上传</div>
            <div class="file-upload">
              <div class="upload-title">图片上传</div>
              <div class="upload-area">
                <div class="upload-item" @click="triggerFileUpload">
                  <div class="upload-placeholder">
                    <i class="el-icon-plus"></i>
                  </div>
                  <input type="file" ref="fileInput" style="display: none" @change="handleFileChange" multiple accept="image/*" />
                </div>
                <div v-for="(file, index) in consultationForm.files" :key="index" class="upload-item">
                  <div class="file-preview">
                    <img :src="file.url" alt="预览图" />
                    <div class="file-delete" @click="removeFile(index)">×</div>
                  </div>
                </div>
              </div>
              <div class="upload-hint">六个图片可被添加</div>
            </div>
          </div>
          
          <div class="action-buttons">
            <button class="save-btn" @click="saveConsultation">保存并发送通知</button>
            <button class="cancel-btn" @click="closeCreateConsultation">取消</button>
          </div>
        </div>
      </div>
      
      <!-- 会议聊天界面 -->
      <div v-if="showMeetingChat && !showPatientDetail && !showCreateConsultation" class="meeting-chat">
        <!-- 会议头部 -->
        <div class="detail-header">
          <div class="current-location">当前位置：会诊管理 > 会诊详情 > 正在会诊中</div>
          <div class="header-actions">
            <button class="invite-btn">邀请患者</button>
            <button class="setting-btn">修改患者</button>
            <button class="end-btn">会议结束</button>
            <div class="back-button" @click="closeMeetingChat">返回上一级</div>
          </div>
        </div>
        
        <div class="chat-container">
          
          <!-- 中间聊天区域 -->
          <span>中间聊天区域</span>
          
          <!-- 右侧参会人员 -->
          <span>右侧参会人员</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatRegion } from '@/utils/common'
import MainTitle from '@/components/Block/mainTitle.vue'
import CusList from '@/components/CusList/index.vue'
import CusForm from '@/components/CusForm/index.vue'
import PatientDetail from '@/views/patient/detail.vue'
import { DICT } from '@/utils/constant'
// 导入模拟数据
import mockData from '@/mock/consultation.json'
import patientData from '@/mock/patient.json'
import patientSearchData from '@/mock/patientSearch.json'

// 模拟患者数据
patientData.patientList = [
  {
    pkId: 1,
    name: '张三',
    gender: '男',
    age: 45,
    birthDate: '1978-05-15',
    idNumber: '110101197805153456',
    phone: '13812345678',
    height: '178',
    weight: '75',
    hometown: '北京市',
    occupation: '工程师',
    maritalStatus: '已婚',
    ethnicity: '汉族',
    hospitalName: '北京协和医院',
    dept: '心内科',
    disease: '冠心病'
  },
  {
    pkId: 2,
    name: '李四',
    gender: '女',
    age: 32,
    birthDate: '1991-10-20',
    idNumber: '110101199110204567',
    phone: '13987654321',
    height: '165',
    weight: '52',
    hometown: '上海市',
    occupation: '教师',
    maritalStatus: '已婚',
    ethnicity: '汉族',
    hospitalName: '上海第一人民医院',
    dept: '内分泌科',
    disease: '糖尿病'
  },
  {
    pkId: 3,
    name: '王五',
    gender: '男',
    age: 58,
    birthDate: '1965-03-25',
    idNumber: '110101196503255678',
    phone: '13765432198',
    height: '172',
    weight: '80',
    hometown: '广州市',
    occupation: '退休',
    maritalStatus: '已婚',
    ethnicity: '汉族',
    hospitalName: '广州中山医院',
    dept: '神经内科',
    disease: '脑梗塞'
  },
  {
    pkId: 4,
    name: '赵六',
    gender: '女',
    age: 27,
    birthDate: '1996-12-10',
    idNumber: '110101199612106789',
    phone: '13612345678',
    height: '160',
    weight: '48',
    hometown: '成都市',
    occupation: '学生',
    maritalStatus: '未婚',
    ethnicity: '藏族',
    hospitalName: '成都华西医院',
    dept: '皮肤科',
    disease: '银屑病'
  },
  {
    pkId: 5,
    name: '孙七',
    gender: '男',
    age: 65,
    birthDate: '1958-08-05',
    idNumber: '110101195808057890',
    phone: '13512345678',
    height: '175',
    weight: '68',
    hometown: '武汉市',
    occupation: '退休',
    maritalStatus: '已婚',
    ethnicity: '汉族',
    hospitalName: '武汉同济医院',
    dept: '肿瘤科',
    disease: '肺癌'
  }
];

export default {
  name: 'ConsultationManagement',
  components: { 
    CusForm, 
    CusList, 
    MainTitle,
    PatientDetail
  },
  data() {
    return {
      showMain: true,
      showDetail: false,
      showForm: false,
      showPatientDetail: false, // 是否显示患者详情
      showPatientDetailXQ: false, // 是否显示患者档案详情
      showCreateConsultation: false, // 是否显示新建会诊表单
      apiConfig: {},
      queryConfig: {},
      tableConfig: {},
      formConfig: {},
      currentRow: {},
      searchQuery: '',
      startDate: '',
      endDate: '',
      activeStatus: 'consultation', // 修改为默认显示"待会诊"
      tableData: [],
      statusCounts: {
        special: 0,
        consultation: 0,
        completed: 0,
        cancelled: 0
      },
      // 等待会诊列表数据 - 改为动态计算
      waitingList: [],
      // 当前会诊患者 - 改为动态计算
      currentConsultation: null,
      // 模拟数据
      mockData: [],
      // 患者信息
      patientInfo: {},
      // 会诊状态映射
      consultationStatusMap: {
        0: 'pending',    // 待确认
        1: 'pending',    // 待会诊
        2: 'completed',  // 已会诊
        3: 'cancelled',  // 已取消
        4: 'inProgress'  // 会诊中
      },
      // 分页相关
      currentPage: 1,
      pageSize: 12,
      total: 0,
      // 添加定时器ID
      waitingListTimer: null,

      approved: false,
      consultationForm: {
        patientName: '',
        gender: '男',
        maritalStatus: '',
        ethnicity: '',
        age: 27,
        phone: '18888888888',
        idType: '身份证',
        birthDate: '',
        idNumber: '',
        height: '',
        hometown: '',
        weight: '',
        occupation: '',
        chiefComplaint: '',
        clinicalDiagnosis: '',
        physicalSigns: '',
        consultationPurpose: '',
        files: []
      },
      selectingExperts: false,
      expertSearchQuery: '',
      expertDepartment: '',
      expertAvailableDate: '',
      filteredExperts: [],
      selectedExperts: [],
      currentChatPatient: {},
      chatMessages: [],
      participants: [],
      showMeetingChat: false,
      chatInputText: '',
      nationOptions: ['汉族', '蒙古族', '回族', '藏族', '维吾尔族', '苗族', '彝族', '壮族', '布依族', '朝鲜族', '满族', '侗族', '瑶族', '白族', '土家族', '哈尼族', '哈萨克族', '傣族', '黎族', '傈僳族', '佤族', '畲族', '高山族', '拉祜族', '水族', '东乡族', '纳西族', '景颇族', '柯尔克孜族', '土族', '达斡尔族', '仫佬族', '羌族', '布朗族', '撒拉族', '毛南族', '仡佬族', '锡伯族', '阿昌族', '普米族', '塔吉克族', '怒族', '乌孜别克族', '俄罗斯族', '鄂温克族', '德昂族', '保安族', '裕固族', '京族', '塔塔尔族', '独龙族', '鄂伦春族', '赫哲族', '门巴族', '珞巴族', '基诺族', '其他'],
      searchPatientName: '',
      showSearchResults: false,
      filteredPatients: [],
      selectedPatient: {},
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    },
    // 计算今天的日期（格式：YYYY-MM-DD）
    todayDate() {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    // 实时计算各状态数量
    specialCount() {
      return this.mockData.filter(item => 
        item.consultationStatus === 0 && item.approved === false
      ).length;
    },
    consultationCount() {
      return this.mockData.filter(item => 
        (item.consultationStatus === 0 && item.approved === true) || 
        item.consultationStatus === 1 ||
        item.consultationStatus === 4
      ).length;
    },
    completedCount() {
      return this.mockData.filter(item => 
        item.consultationStatus === 2
      ).length;
    },
    cancelledCount() {
      return this.mockData.filter(item => 
        item.consultationStatus === 3
      ).length;
    }
  },
  created() {
    // 初始化模拟数据
    this.mockData = mockData.consultationData || []
    this.updateWaitingList() // 更新等待会诊列表和当前会诊患者
    this.init()
    this.updateStatusCounts()
    
    // 直接筛选并显示数据，而不是调用handleQuery
    if (this.mockData && this.mockData.length > 0) {
      const filteredData = this.getFilteredDataByStatus(this.activeStatus)
      this.updatePaginatedData(filteredData)
    }
  },
  mounted() {
    // 在组件挂载后确保数据已加载
    this.$nextTick(() => {
      // 确保表格数据已更新
      if (!this.tableData || this.tableData.length === 0) {
        const filteredData = this.getFilteredDataByStatus(this.activeStatus)
        this.updatePaginatedData(filteredData)
      }
      
      // 设置定时器，每秒更新等待会诊列表时间
      this.waitingListTimer = setInterval(() => {
        this.updateWaitingListTimes();
      }, 1000);
    })
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    if (this.waitingListTimer) {
      clearInterval(this.waitingListTimer);
      this.waitingListTimer = null;
    }
  },
  methods: {
    apiGetList(params) {
      return this.$request.get(`/admin/consultation/list`, { params })
    },
    apiAdd(params) {
      return this.$request.post(`/admin/consultation`, params)
    },
    apiUpdate(params) {
      return this.$request.put(`/admin/consultation`, params)
    },
    init() {
      this.apiConfig = {
        auto: true,
        api: this.apiGetList,
        params: {}
      }
      this.queryConfig = {
        showQueryButton: true,
        showAddButton: true,
        showLabel: true,
        queryItems: [
          { label: '患者姓名', filed: 'patientName', type: TABLE_QUERY_ITEM_TYPE.Input },
          { label: '会诊状态', filed: 'status', type: TABLE_QUERY_ITEM_TYPE.Select, options: DICT.consultationStatus },
          {
            label: '会诊日期',
            startDatePlaceholder: '开始日期',
            endDatePlaceholder: '结束日期',
            startDateFiled: 'startDate',
            endDateFiled: 'endDate',
            type: TABLE_QUERY_ITEM_TYPE.DateRange
          }
        ],
        handleAdd: this.handleAdd,
        afterQuery: (res) => {
        }
      }
      this.tableConfig = {
        columns: [
          { label: '会诊编号', filed: 'pkId', width: '100px' },
          { label: '患者姓名', filed: 'patientName', width: '100px' },
          { label: '会诊类型', filed: 'type', width: '100px' },
          { label: '会诊科室', filed: 'department' },
          { label: '主诊医生', filed: 'mainDoctor' },
          { label: '会诊医生', filed: 'consultationDoctors' },
          { label: '会诊时间', filed: 'consultationTime', format: 'time' },
          { label: '会诊状态', filed: 'status', format: val => {
            const statusItem = DICT.consultationStatus.find(item => item.value === val);
            return statusItem ? statusItem.label : '';
          }},
          {
            label: '操作', type: TABLE_COLUMN_ITEM_TYPE.Operation, width: '240px', fixed: 'right',
            options: [
              { label: '编辑', disabled: row => row.status === 'completed', click: this.handleEdit },
              { label: '删除', disabled: row => row.status === 'completed', click: this.handleDelete },
              { label: '详情', disabled: row => false, click: this.handleDetail },
            ]
          }
        ]
      }
      this.formConfig = {
        mode: FORM_MODE.Edit,
        title: '',
        formData: {},
        columnCount: 1,
        key: 'pkId',
        dataApi: null,
        addApi: this.apiAdd,
        editApi: this.apiUpdate,
        beforeSave: this.beforeSave,
        items: [
          {
            label: '患者姓名',
            filed: 'patientName',
            type: FORM_ITEM_TYPE.Input,
            required: true
          },
          {
            label: '会诊类型',
            filed: 'type',
            type: FORM_ITEM_TYPE.Select,
            options: DICT.consultationType,
            required: true
          },
          {
            label: '会诊科室',
            filed: 'department',
            type: FORM_ITEM_TYPE.Select,
            options: DICT.departments,
            required: true
          },
          {
            label: '主诊医生',
            filed: 'mainDoctor',
            type: FORM_ITEM_TYPE.Select,
            options: [],
            required: true
          },
          {
            label: '会诊医生',
            filed: 'consultationDoctors',
            type: FORM_ITEM_TYPE.MultiSelect,
            options: [],
            required: true
          },
          {
            label: '会诊时间',
            filed: 'consultationTime',
            type: FORM_ITEM_TYPE.DateTime,
            required: true
          },
          {
            label: '会诊说明',
            filed: 'description',
            type: FORM_ITEM_TYPE.TextArea,
            required: false
          }
        ]
      }
    },
    beforeSave(formData) {
      return formData
    },
    handleAdd() {
      this.formConfig.mode = FORM_MODE.Add
      this.formConfig.title = '新增会诊'
      this.formConfig.formData = {}
      this.showForm = false // 不使用原表单
      this.showCreateConsultation = true // 显示新的表单
      this.selectingExperts = true // 首先显示选择专家界面
      
      // 重置表单数据
      this.consultationForm = {
        patientName: '',
        gender: '男',
        maritalStatus: '',
        ethnicity: '',
        age: 27,
        phone: '18888888888',
        idType: '身份证',
        birthDate: '',
        idNumber: '',
        height: '',
        hometown: '',
        weight: '',
        occupation: '',
        chiefComplaint: '',
        clinicalDiagnosis: '',
        physicalSigns: '',
        consultationPurpose: '',
        files: []
      }
      
      // 重置专家选择相关数据
      this.expertSearchQuery = '';
      this.expertDepartment = '';
      this.expertAvailableDate = new Date().toISOString().split('T')[0];
      this.selectedExperts = [];
      
      // 初始加载专家列表
      this.searchExperts();
    },
    handleEdit(row) {
      this.currentRow = row
      this.formConfig.mode = FORM_MODE.Edit
      this.formConfig.title = '编辑会诊'
      this.formConfig.formData = row
      this.showForm = true
    },
    handleDelete(row) {
      this.$confirm('确认要删除该会诊记录吗？').then(() => {
        this.$request.delete('/admin/consultation/' + row.recordId).then(res => {
          if (res) {
            this.$message.success('删除成功')
            this.$refs.list.refresh()
          } else {
            this.$message.error('删除失败')
          }
        })
      })
    },
    handleDetail(row) {
      this.currentRow = row
      this.showMain = false
      this.showDetail = true
    },
    handleFormClose(flag) {
      if (flag) {
        this.$refs.list.refresh()
      }
    },
    onClose() {
      this.showDetail = false
      this.showMain = true
    },
    handleSearch() {
      // 根据搜索条件过滤表格数据
      if (!this.searchQuery.trim()) {
        this.filterDataByStatus(this.activeStatus)
        return
      }
      
      const query = this.searchQuery.toLowerCase()
      const filteredData = this.mockData.filter(item => {
        return (
          item.patientName.toLowerCase().includes(query) ||
          this.getDoctorNames(item).toLowerCase().includes(query)
        )
      })
      
      this.updatePaginatedData(filteredData)
    },
    handleDateChange() {
      // 暂时不处理日期变化
    },
    handleQuery() {
      // 根据日期范围过滤数据
      let filteredData = this.getFilteredDataByStatus(this.activeStatus);
      
      if (this.startDate) {
        filteredData = filteredData.filter(item => {
          const consultDate = item.startTime.split(' ')[0];
          return consultDate >= this.startDate;
        });
      }
      
      if (this.endDate) {
        filteredData = filteredData.filter(item => {
          const consultDate = item.startTime.split(' ')[0];
          return consultDate <= this.endDate;
        });
      }
      
      this.updatePaginatedData(filteredData);
    },
    handleStatusChange(tab) {
      this.activeStatus = tab.name
      this.currentPage = 1
      this.filterDataByStatus(tab.name)
    },
    // 根据状态筛选数据
    filterDataByStatus(status) {
      const filteredData = this.getFilteredDataByStatus(status)
      this.updatePaginatedData(filteredData)
    },
    // 获取按状态筛选的数据
    getFilteredDataByStatus(status) {
      // 模拟从API获取数据
      // 实际项目中应该调用API获取数据
      if (status === 'special') {
        // 待确认：状态为0且未批准
        return this.mockData.filter(item => 
          item.consultationStatus === 0 && item.approved === false
        )
      } else if (status === 'consultation') {
        // 待会诊：状态为0且已批准 或 状态为1或4（会诊中）
        return this.mockData.filter(item => 
          (item.consultationStatus === 0 && item.approved === true) || 
          item.consultationStatus === 1 ||
          item.consultationStatus === 4
        )
      } else if (status === 'completed') {
        // 已会诊：状态为2
        return this.mockData.filter(item => 
          item.consultationStatus === 2
        )
      } else if (status === 'cancelled') {
        // 已取消：状态为3
        return this.mockData.filter(item => 
          item.consultationStatus === 3
        )
      } else {
        return this.mockData
      }
    },
    // 更新分页数据
    updatePaginatedData(data) {
      this.total = data.length
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      this.tableData = data.slice(start, end)
    },
    // 上一页
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.handleQuery()
      }
    },
    // 下一页
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.handleQuery()
      }
    },
    handleView(row) {
      // 实现查看详情逻辑
      this.handleDetail(row);
      // 添加延时显示患者详情
      setTimeout(() => {
        this.showPatientDetail = true;
      }, 300);
    },
    getStatusClass(status) {
      const statusClassMap = {
        0: 'status-pending',    // 待确认
        1: 'status-pending',    // 待会诊
        2: 'status-completed',  // 已会诊
        3: 'status-cancelled',  // 已取消
        4: 'status-inProgress'  // 会诊中
      }
      return statusClassMap[status] || 'status-default'
    },
    getStatusType(status) {
      const statusMap = {
        0: 'warning',   // 待确认
        1: 'warning',   // 待会诊
        2: 'success',   // 已会诊
        3: 'info',      // 已取消
        4: 'primary'    // 会诊中
      }
      return statusMap[status] || 'info'
    },
    getStatusText(status) {
      const statusMap = {
        0: '待确认',
        1: '待会诊',
        2: '已完成',
        3: '已取消',
        4: '会诊中'
      }
      return statusMap[status] || '未知'
    },
    // 获取参会医生名称
    getDoctorNames(record) {
      if (!record.participatingDoctors || !record.participatingDoctors.length) {
        return '';
      }
      return record.participatingDoctors.map(doc => doc.doctorName).join('、');
    },
    // 格式化日期
    formatDate(dateTimeStr) {
      if (!dateTimeStr) return '';
      
      // 简单处理，仅显示月日和时间
      const date = new Date(dateTimeStr)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hours = date.getHours()
      
      return `${year}年${month}月${day}日${hours}时`
    },
    // 格式化会诊时间
    formatConsultationTime(startTime, endTime) {
      if (!startTime || !endTime) return '';
      
      // 显示完整的会诊时间，包括年月日
      const dateStr = startTime.split(' ')[0].replace(/-/g, '/')
      
      // 截取时间部分
      const startTimeStr = startTime.substr(11, 5);
      const endTimeStr = endTime.substr(11, 5);
      
      return `${dateStr} ${startTimeStr}-${endTimeStr}`;
    },
    // 更新各状态计数 (仅用于手动触发更新)
    updateStatusCounts() {
      // 由于现在使用计算属性，此方法可以留空或用于其他用途
      // 如需要手动触发视图更新可以使用 this.$forceUpdate()
    },
    // 显示患者档案详情
    viewPatientDetail(row) {
      // 处理患者详情
      this.handleDetail(row);
      // 添加延时显示患者详情
      setTimeout(() => {
        this.showPatientDetail = true;
      }, 300);
    },
    // 关闭患者档案详情
    closePatientDetail() {
      this.showPatientDetail = false
    },
    // 更新等待会诊列表和当前会诊患者
    updateWaitingList() {
      // 筛选今日待会诊的患者（状态为0且已批准，或状态为1，或状态为4）
      const todayConsultations = this.mockData.filter(item => {
        const consultationDate = item.startTime.split(' ')[0]
        const isTodayConsultation = consultationDate === this.todayDate
        const isWaiting = ((item.consultationStatus === 0 && item.approved === true) || 
                          item.consultationStatus === 1)
        const isInProgress = item.consultationStatus === 4
        
        return isTodayConsultation && (isWaiting || isInProgress)
      })
      
      // 找出正在会诊的患者（状态为4）
      const currentConsultation = todayConsultations.find(item => item.consultationStatus === 4)
      this.currentConsultation = currentConsultation || null
      
      // 筛选待会诊的患者（排除正在会诊的）
      const waitingPatients = todayConsultations.filter(item => item.consultationStatus !== 4)
      
      // 格式化等待会诊列表数据
      this.waitingList = waitingPatients.map(item => {
        // 计算剩余时间
        const startTime = new Date(item.startTime)
        const now = new Date()
        const diffMs = startTime - now
        
        // 格式化成"00:30:30后开始"格式
        let timeText = ''
        if (diffMs > 0) {
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
          const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
          const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000)
          
          timeText = `${String(diffHours).padStart(2, '0')}:${String(diffMinutes).padStart(2, '0')}:${String(diffSeconds).padStart(2, '0')}后开始`
        } else {
          timeText = '即将开始'
        }
        
        return {
          patientName: item.patientName,
          status: timeText,
          recordId: item.recordId,
          patientId: item.patientId,
          startTime: item.startTime,
          requestingDoctorName: item.requestingDoctorName
        }
      })
      
      // 更新今日等待会诊总数
      const waitingCount = this.waitingList.length + (this.currentConsultation ? 1 : 0)
      document.querySelector('.waiting-count').textContent = `今日共${waitingCount}名`
    },
    
    // 查看详情时更新等待会诊列表（模拟实时更新）
    handleDetailWithUpdate(row) {
      console.log('row', row.consultationStatus);
      if (row && row.patientId) {
        console.log('row', row);
        // 查找患者信息并显示详情
        this.handleDetail(row);
        // 添加延时显示患者详情
        setTimeout(() => {
          this.showPatientDetail = true;
        }, 300);
      } else {
        this.handleDetail(row);
        // 添加延时显示患者详情
        setTimeout(() => {
          this.showPatientDetail = true;
        }, 300);
      }
      this.updateWaitingList();
    },
    
    // 查看指定患者详情
    handlePatientView(recordId) {
      const patient = this.mockData.find(item => item.recordId === recordId);
      if (patient) {
        this.handleDetail(patient);
      }
    },
    
    // 获取患者信息
    fetchPatientInfo(patientId) {
      // 在实际项目中，这里应该是一个API调用
      // 这里我们使用模拟数据
      try {
        // 从patientData中获取指定ID的患者信息
        const patient = patientData.patientList.find(p => p.id === patientId);
        if (patient) {
          // 获取对应ID的患者详细信息
          // 由于模拟数据中只有一个patient详情，我们需要根据患者ID构造可能的详情
          if (patientId === 1032) {
            // 王强的详情在patientDetail中已经有了
            this.patientInfo = patientData.patientDetail;
          } else {
            // 其他患者需要根据patientList构造基本详情
            this.patientInfo = {
              id: patient.id,
              name: patient.name,
              gender: patient.gender,
              age: patient.age,
              height: patient.gender === '男' ? '175cm' : '165cm',
              weight: patient.gender === '男' ? '70kg' : '55kg',
              chiefComplaint: `患者${patient.name}主因${patient.disease}入院治疗...`,
              physicalSigns: "暂无详细体征记录",
              clinicalDiagnosis: patient.disease,
              consultationPurpose: `针对${patient.disease}进行专家会诊，制定最佳诊疗方案。`,
              images: []
            };
          }
        } else {
          // 未找到患者信息，使用默认数据
          this.patientInfo = {};
          console.warn('未找到患者信息，ID:', patientId);
        }
      } catch (e) {
        console.error('获取患者信息失败', e);
        this.patientInfo = {};
      }
    },
    // 只更新等待会诊列表的时间显示
    updateWaitingListTimes() {
      // 更新等待列表中的时间（只更新时间，不重新计算列表）
      this.waitingList = this.waitingList.map(item => {
        const startTime = new Date(item.startTime);
        const now = new Date();
        const diffMs = startTime - now;
        
        let timeText = '';
        if (diffMs > 0) {
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
          
          timeText = `${String(diffHours).padStart(2, '0')}:${String(diffMinutes).padStart(2, '0')}:${String(diffSeconds).padStart(2, '0')}后开始`;
        } else {
          timeText = '即将开始';
        }
        
        return {
          ...item,
          status: timeText
        };
      });
    },
    
    // 计算等待会诊时间
    getWaitingTime(startTimeStr) {
      if (!startTimeStr) return '即将开始';
      
      const startTime = new Date(startTimeStr);
      const now = new Date();
      const diffMs = startTime - now;
      
      if (diffMs > 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        return `${String(diffHours).padStart(2, '0')}:${String(diffMinutes).padStart(2, '0')}:${String(diffSeconds).padStart(2, '0')}后开始`;
      } else {
        return '即将开始';
      }
    },
    
    // 处理进入会议
    handleJoinMeeting(row) {
      console.log('进入会议', row);
      // 在实际应用中，这里应该跳转到会议页面或者调用会议API
      this.$message.success(`正在进入${row.patientName}的会诊会议...`);
      this.enterMeeting(row);
      
    },
    
    // 处理写建议
    handleWriteAdvice(row) {
      console.log('写建议', row);
      // 在实际应用中，这里应该跳转到建议编辑页面
      this.handleDetail(row);
      // 模拟延迟后显示建议编辑界面
      setTimeout(() => {
        this.showPatientDetail = true;
        // 滚动到会诊意见区域
        this.$nextTick(() => {
          const resultElement = document.querySelector('.consultation-result');
          if (resultElement) {
            resultElement.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }, 300);
    },
    // 处理医生已拒绝
    handleShowRejection(row) {
      console.log('医生已拒绝', row);
      // 在实际应用中，这里应该跳转到拒绝原因编辑页面
      this.handleDetail(row);
      // 模拟延迟后显示拒绝原因编辑界面
      setTimeout(() => {
        this.showPatientDetail = true;
        // 滚动到拒绝原因区域
        this.$nextTick(() => {
          const rejectionElement = document.querySelector('.rejection-reason');
          if (rejectionElement) {
            rejectionElement.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }, 300);
    },
    // 处理新建会诊表单
    closeCreateConsultation() {
      if (this.selectingExperts) {
        // 如果在选择专家界面，则直接返回列表
        this.selectingExperts = false;
        this.showCreateConsultation = false;
      } else {
        // 如果在填写表单界面，询问是否返回选择专家页面
        if (this.consultationForm.patientName || this.consultationForm.chiefComplaint) {
          if (confirm('是否放弃当前编辑并返回？')) {
            this.selectingExperts = true; // 返回选择专家页面
          }
        } else {
          this.selectingExperts = true; // 无数据直接返回选择专家页面
        }
      }
    },
    // 处理文件上传
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
      const files = event.target.files;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
          this.consultationForm.files.push({
            url: e.target.result,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      }
    },
    removeFile(index) {
      this.consultationForm.files.splice(index, 1);
    },
    saveConsultation() {
      // 构建会诊数据和患者数据
      const now = new Date();
      const formattedNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      // 设置会诊开始和结束时间
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 1); // 设置为当前时间后一小时
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1); // 持续一小时
      
      const formattedStartTime = `${startTime.getFullYear()}-${String(startTime.getMonth() + 1).padStart(2, '0')}-${String(startTime.getDate()).padStart(2, '0')} ${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}:00`;
      const formattedEndTime = `${endTime.getFullYear()}-${String(endTime.getMonth() + 1).padStart(2, '0')}-${String(endTime.getDate()).padStart(2, '0')} ${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}:00`;
      
      // 生成新的记录ID和患者ID
      const newRecordId = Math.max(...this.mockData.map(item => item.recordId)) + 1;
      const newPatientId = Math.max(...patientData.patientList.map(item => item.id)) + 1;

      // 收集已选择的专家信息
      const selectedDoctors = this.selectedExperts.map(expertId => {
        const expert = this.filteredExperts.find(e => e.id === expertId);
        return {
          doctorId: expertId,
          doctorName: expert ? expert.name : `专家${expertId}`,
          tenantId: 1
        };
      });
      
      // 构建新的consultation记录
      const newConsultation = {
        recordId: newRecordId,
        patientId: newPatientId,
        patientName: this.consultationForm.patientName,
        consultationStatus: 0, // 待确认
        tenantId: 1,
        requestingDeptId: 108,
        requestingDeptName: "心脏外科",
        requestingDoctorId: 10008,
        requestingDoctorName: "张医生",
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        realEndTime: null,
        createdTime: formattedNow,
        deleteMark: 0,
        disease: this.consultationForm.clinicalDiagnosis,
        hospital: "北京协和医院",
        patientGender: this.consultationForm.gender,
        patientAge: `${this.consultationForm.age}岁`,
        approved: false,
        participatingDoctors: selectedDoctors
      };
      
      // 构建新的patient记录
      const newPatient = {
        id: newPatientId,
        name: this.consultationForm.patientName,
        gender: this.consultationForm.gender,
        age: `${this.consultationForm.age}岁`,
        recordId: newRecordId,
        disease: this.consultationForm.clinicalDiagnosis,
        status: 0
      };
      
      // 构建patient详情
      const newPatientDetail = {
        id: newPatientId,
        name: this.consultationForm.patientName,
        gender: this.consultationForm.gender,
        age: `${this.consultationForm.age}岁`,
        height: this.consultationForm.height ? `${this.consultationForm.height}cm` : "",
        weight: this.consultationForm.weight ? `${this.consultationForm.weight}kg` : "",
        chiefComplaint: this.consultationForm.chiefComplaint,
        physicalSigns: this.consultationForm.physicalSigns,
        clinicalDiagnosis: this.consultationForm.clinicalDiagnosis,
        consultationPurpose: this.consultationForm.consultationPurpose,
        images: this.consultationForm.files.map((file, index) => ({
          url: file.url,
          description: `上传图片${index + 1}`
        }))
      };
      
      console.log('新的会诊记录:', newConsultation);
      console.log('新的患者记录:', newPatient);
      console.log('患者详情:', newPatientDetail);
      
      try {
        // 1. 更新 consultation.json
        // 添加新的会诊记录到模拟数据中
        this.mockData.push(newConsultation);
        
        // 在实际应用中，这里会使用API保存到服务器
        // 模拟保存到JSON文件
        const consultationData = {
          consultationData: this.mockData,
          statusCounts: {
            special: this.specialCount + 1, // 增加待确认数量
            consultation: this.consultationCount,
            completed: this.completedCount,
            cancelled: this.cancelledCount
          },
          waitingPatients: mockData.waitingPatients,
          currentPatient: mockData.currentPatient
        };
        
        // 2. 更新 patient.json
        // 添加新的患者记录
        patientData.patientList.push(newPatient);
        
        // 创建新的患者详情，但不覆盖原有的
        const patientDataUpdated = {
          patientDetail: newPatientDetail, // 在实际应用中应保留原来的patientDetail并添加新的
          patientList: patientData.patientList,
          doctorInfo: patientData.doctorInfo
        };
        
        // 模拟保存到JSON文件
        // 在实际应用中，这里会使用API发送数据到服务器
        localStorage.setItem('mock_consultation_data', JSON.stringify(consultationData));
        localStorage.setItem('mock_patient_data', JSON.stringify(patientDataUpdated));
        
        // 更新本地数据结构
        Object.assign(mockData, consultationData);
        Object.assign(patientData, patientDataUpdated);
        
        // 更新状态计数和等待列表
        this.updateStatusCounts();
        this.updateWaitingList();
        
        // 显示成功消息
        this.$message.success('会诊创建成功！数据已保存');
        
        // 关闭表单
        this.showCreateConsultation = false;
      } catch (error) {
        console.error('保存数据失败:', error);
        this.$message.error('保存失败，请重试');
      }
    },
    searchExperts() {
      // 实现搜索专家的逻辑
      console.log('搜索专家', this.expertSearchQuery, this.expertDepartment, this.expertAvailableDate);
      
      // 模拟专家数据库
      const allExperts = [
        {
          id: 1,
          name: '张三',
          title: '主任医师',
          hospital: '武汉XXXX医院',
          department: '影像介入科',
          description: '擅长各种影像学诊断和介入治疗'
        },
        {
          id: 2,
          name: '李四',
          title: '副主任医师',
          hospital: '武汉XXXX医院',
          department: '影像介入科',
          description: '擅长影像学诊断和介入治疗'
        },
        {
          id: 3,
          name: '王五',
          title: '主任医师',
          hospital: '北京协和医院',
          department: '内科',
          description: '擅长心血管疾病诊断和治疗'
        },
        {
          id: 4,
          name: '赵六',
          title: '副主任医师',
          hospital: '上海XX医院',
          department: '外科',
          description: '擅长普外科手术'
        }
      ];
      
      // 根据搜索条件筛选专家
      this.filteredExperts = allExperts.filter(expert => {
        // 筛选姓名或专业
        const nameMatch = !this.expertSearchQuery || 
          expert.name.includes(this.expertSearchQuery) || 
          expert.description.includes(this.expertSearchQuery);
        
        // 筛选科室
        const deptMatch = !this.expertDepartment || 
          expert.department === this.expertDepartment;
        
        // 日期筛选（模拟，实际应调用API）
        const dateMatch = true; // 简化处理，假设所有医生在所选日期都可用
        
        return nameMatch && deptMatch && dateMatch;
      });
      
      // 如果没有结果，显示提示
      if (this.filteredExperts.length === 0) {
        alert('没有找到符合条件的专家');
        // 重置为所有专家
        this.filteredExperts = allExperts;
      }
    },
    toggleExpertSelection(id) {
      if (this.selectedExperts.includes(id)) {
        this.selectedExperts = this.selectedExperts.filter(i => i !== id);
      } else {
        this.selectedExperts.push(id);
      }
    },
    proceedToConsultationForm() {
      // 实现进入会诊信息表单的逻辑
      console.log('进入会诊信息表单', this.selectedExperts);
      this.selectingExperts = false;
    },
    closeMeetingChat() {
      this.showMeetingChat = false;
    },
    sendChatMessage() {
      // 这里应该实现发送聊天消息的逻辑
      console.log('发送聊天消息:', this.chatInputText);
      this.chatMessages.push({
        sender: '医生',
        text: this.chatInputText,
        time: new Date().toLocaleTimeString(),
        isSelf: true,
        avatar: 'https://via.placeholder.com/40'
      });
      this.chatInputText = '';
    },
    enterMeeting(record) {
      console.log('进入会议:', record);
      this.currentChatPatient = record;
      this.showPatientDetail = false;
      this.showCreateConsultation = false;
      this.showMeetingChat = true;
      
      // 初始化聊天消息和参会人员
      this.chatMessages = [
        {
          sender: '系统',
          text: `会诊已开始，患者${record.patientName}已加入会诊室`,
          time: new Date().toLocaleTimeString(),
          isSelf: false,
          avatar: 'https://via.placeholder.com/40'
        }
      ];
      
      // 初始化参会人员列表
      this.participants = [
        { name: record.requestingDoctorName, avatar: 'https://via.placeholder.com/40' }
      ];
      
      if (record.participatingDoctors && record.participatingDoctors.length > 0) {
        record.participatingDoctors.forEach(doctor => {
          this.participants.push({
            name: doctor.name,
            avatar: 'https://via.placeholder.com/40'
          });
        });
      }
    },
    findConsultationByRecordId(recordId) {
      return this.mockData.find(item => item.recordId === recordId);
    },
    searchPatients() {
      this.showSearchResults = true;
      this.filteredPatients = patientSearchData.patientList.filter(patient => 
        patient.name.toLowerCase().includes(this.consultationForm.patientName.toLowerCase())
      );
    },
    selectPatient(patient) {
      this.consultationForm.patientName = patient.name;
      this.consultationForm.age = patient.age;
      this.consultationForm.gender = patient.gender;
      this.consultationForm.idType = '身份证';
      this.consultationForm.idNumber = patient.idNumber;
      this.consultationForm.height = patient.height;
      this.consultationForm.weight = patient.weight;
      this.consultationForm.hometown = patient.hometown;
      this.consultationForm.occupation = patient.occupation;
      this.consultationForm.maritalStatus = patient.maritalStatus;
      this.consultationForm.ethnicity = patient.ethnicity;
      this.consultationForm.birthDate = patient.birthDate;
      this.consultationForm.phone = patient.phone;
      this.consultationForm.chiefComplaint = `患者${patient.name}主因${patient.disease}入院治疗...`;
      this.consultationForm.physicalSigns = "暂无详细体征记录";
      this.consultationForm.clinicalDiagnosis = patient.disease;
      this.consultationForm.consultationPurpose = `针对${patient.disease}进行专家会诊，制定最佳诊疗方案。`;
      this.consultationForm.files = [];
      this.selectedPatient = patient;
      this.showSearchResults = false;
    },
    showPatientDetailPopup() {
      if (!this.consultationForm.patientName) {
        this.$message.warning('请先选择一个患者');
        return;
      }
      this.showPatientDetailXQ = true;
    },
    goToPatientDetail() {
      if (!this.consultationForm.patientName) {
        this.$message.warning('请先选择一个患者');
        return;
      }
      
      // 查找患者数据
      let patientInfo = null;
      if (this.selectedPatient && this.selectedPatient.pkId) {
        patientInfo = this.selectedPatient;
      } else {
        // 如果没有选中具体患者但有姓名，可以尝试查找
        patientInfo = patientSearchData.patientList.find(
          p => p.name === this.consultationForm.patientName
        );
      }
      
      if (patientInfo) {
        // 转换为PatientDetail组件需要的格式
        this.selectedPatient = {
          pkId: patientInfo.pkId,
          name: patientInfo.name,
          sex: patientInfo.gender === '男' ? 1 : 2,
          age: patientInfo.age,
          mobile: patientInfo.phone,
          dob: patientInfo.birthDate,
          ssn: patientInfo.idNumber,
          dept: patientInfo.dept,
          hospitalName: patientInfo.hospitalName
        };
        this.showPatientDetailXQ = true;
      } else {
        this.$message.error('无法找到患者信息');
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.please-container {
  width: 100%;
  height: 100%;
  display: flex;
  
  .right-sidebar {
    width: 192px;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    
    .current-consultation {
      background-color: #4cae4f;
      padding: 0;
      margin-bottom: 10px;
      
      .current-header {
        background-color: #4cae4f;
        color: white;
        padding: 10px;
        text-align: center;
        font-weight: normal;
        font-size: 14px;
      }
      
      .current-patient {
        padding: 15px;
        background-color: white;
        color: #333;
        border-left: 4px solid #4cae4f;
        
        .patient-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .patient-info, .patient-time {
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .patient-link {
          font-size: 12px;
          color: #4cae4f;
          cursor: pointer;
          margin-top: 15px;
          border-top: 1px solid #eee;
          padding-top: 10px;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
    
    .waiting-list {
      flex: 1;
      
      .waiting-header {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        border-left: 4px solid #4cae4f;
        background-color: white;
        
        .waiting-title {
          font-weight: bold;
          color: #333;
          font-size: 14px;
        }
        
        .waiting-count {
          color: #999;
          font-size: 12px;
        }
      }
      
      .waiting-items {
        .waiting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 10px;
          border-bottom: 1px solid #eee;
          background-color: white;
          cursor: pointer;
          
          &:hover {
            background-color: #f9f9f9;
          }
          
          .item-left {
            .patient-name {
              font-size: 14px;
              color: #333;
              margin-bottom: 5px;
            }
            
            .initiator {
              font-size: 12px;
              color: #999;
              margin-bottom: 5px;
            }
            
            .wait-time {
              font-size: 12px;
              color: #f56c6c;
              font-weight: bold;
            }
          }
          
          .item-right {
            color: #ccc;
          }
        }
        
        .view-more {
          text-align: center;
          padding: 10px;
          color: #999;
          font-size: 12px;
          background-color: white;
          cursor: pointer;
          
          &:hover {
            color: #4cae4f;
          }
        }
        
        .empty-waiting {
          text-align: center;
          padding: 20px;
          color: #999;
          font-size: 13px;
          background-color: white;
        }
      }
    }
  }
  
  .content-area {
    flex: 1;
    overflow-y: auto;
    height: 100%;
    min-width: 0;
    position: relative;
  }
}

.consultation-container {
  padding: 20px;
  
  .header-info {
    margin-bottom: 20px;
    
    .location {
      color: #666;
      margin-bottom: 15px;
    }
    
    .search-bar {
      display: flex;
      gap: 10px;
      align-items: center;
    }
  }
  
  .status-tabs {
    margin-bottom: 10px;
    
    .tabs-container {
      display: flex;
      border-bottom: 1px solid #e0e0e0;
      
      .tab-item {
        padding: 12px 20px;
        cursor: pointer;
        transition: all 0.3s;
        font-size: 14px;
        position: relative;
        
        &.active {
          color: #4cae4f;
          font-weight: bold;
          
          &:after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background-color: #4cae4f;
          }
        }
        
        &:hover:not(.active) {
          color: #4cae4f;
        }
      }
    }
  }
  
  .date-filter {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    
    span {
      margin: 0 10px;
    }
    
    .date-input {
      width: 150px;
    }
    
    .query-btn {
      margin-left: 10px;
    }
  }
  
  .consultation-table {
    background-color: #fff;
    border-radius: 4px;
    overflow: hidden;
    
    .full-width-table {
      width: 100%;
      border-collapse: collapse;
      
      th, td {
        padding: 12px 8px;
        text-align: center;
        border-bottom: 1px solid #eee;
      }
      
      th {
        background-color: #f5f5f5;
        font-weight: normal;
        color: #606266;
      }
      
      tr:hover {
        background-color: #f9f9f9;
      }
      
      .status-tag {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 12px;
        
        &.status-pending {
          color: #E6A23C;
          background-color: #FDF6EC;
        }
        
        &.status-completed {
          color: #67C23A;
          background-color: #F0F9EB;
        }
        
        &.status-cancelled {
          color: #909399;
          background-color: #F4F4F5;
        }
        
        &.status-inProgress {
          color: #409EFF;
          background-color: #ECF5FF;
        }
      }
      
      .view-btn {
        background-color: #e8f5e9;
        color: #4cae4f;
        border: 1px solid #c8e6c9;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        
        &:hover {
          background-color: #c8e6c9;
        }
      }
    }
    
    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      
      .pagination-info {
        color: #606266;
      }
      
      .pagination-controls {
        display: flex;
        align-items: center;
        
        .pagination-btn {
          width: 28px;
          height: 28px;
          border: 1px solid #dcdfe6;
          background-color: #fff;
          border-radius: 2px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          
          &:disabled {
            color: #c0c4cc;
            cursor: not-allowed;
          }
          
          &:not(:disabled):hover {
            color: #409eff;
            border-color: #c6e2ff;
          }
        }
        
        .pagination-current {
          margin: 0 10px;
        }
      }
    }
  }
}

.embedded-patient-detail {
  padding: 0 20px 0 0;
  position: relative;
  display: flex;
  height: 100%;
  
  .detail-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 15px 20px;
    background-color: #fff;
    border-bottom: 1px solid #e0e0e0;
    z-index: 10;
    
    .current-location {
      color: #666;
    }
    
    .back-button {
      color: #2196f3;
      cursor: pointer;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .detail-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 60px 20px 20px 20px;
    overflow-y: auto;
    
    .detail-tabs {
      display: flex;
      margin-bottom: 20px;
      
      .tab {
        padding: 10px 15px;
        background-color: #e0e0e0;
        margin-right: 10px;
        cursor: pointer;
        
        &.active {
          background-color: #4cae4f;
          color: white;
          font-weight: bold;
        }
      }
    }
    
    .info-section {
      background-color: #fff;
      margin-bottom: 20px;
      
      .section-title {
        padding: 10px 15px;
        border-bottom: 3px solid #4cae4f;
        font-weight: bold;
      }
      
      .basic-info {
        padding: 15px;
        
        .info-row {
          display: flex;
          flex-wrap: wrap;
          
          .info-item {
            margin-right: 20px;
            margin-bottom: 10px;
          }
        }
      }
      
      .section-content {
        padding: 15px;
        color: #333;
        line-height: 1.5;
        word-break: break-all;
      }
      
      .upload-section {
        padding: 15px;
        
        .upload-text {
          margin-bottom: 15px;
          color: #666;
        }
        
        .upload-gallery {
          display: flex;
          gap: 15px;
          
          .image-item {
            width: 120px;
            height: 120px;
            
            .placeholder-image {
              width: 100%;
              height: 100%;
              background-color: #eee;
              display: flex;
              align-items: center;
              justify-content: center;
              
              &::before {
                content: '＋';
                color: #ccc;
                font-size: 24px;
              }
            }
          }
        }
      }
    }
  }
  
  .detail-right-sidebar {
    width: 320px;
    background-color: #fff;
    border-left: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    padding-top: 60px;
    
    .right-sidebar-title {
      padding: 10px 15px;
      background-color: #f5f5f5;
      border-bottom: 2px solid #4cae4f;
      font-weight: bold;
    }
    
    .similar-case-empty {
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #666;
      
      .empty-text {
        color: white;
        font-size: 18px;
      }
    }
    
    .doctor-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .doctor-section-title {
        padding: 10px 15px;
        background-color: #f5f5f5;
        border-bottom: 2px solid #4cae4f;
        font-weight: bold;
      }
      
      .doctor-card {
        padding: 15px;
        display: flex;
        align-items: center;
        background-color: #e0f2e1;
        
        .doctor-avatar {
          width: 60px;
          height: 60px;
          background-color: #ccc;
          margin-right: 15px;
        }
        
        .doctor-info {
          .doctor-name {
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .doctor-hospital {
            font-size: 14px;
            color: #666;
          }
        }
      }
      
      .doctor-remarks {
        padding: 15px;
        
        .remarks-title {
          margin-bottom: 10px;
          font-weight: bold;
        }
        
        .remarks-content {
          font-size: 14px;
          line-height: 1.5;
          color: #666;
          word-break: break-all;
        }
      }
      
      .consultation-result {
        padding: 15px;
        
        .result-title {
          margin-bottom: 10px;
          font-weight: bold;
        }
        
        .result-content {
          textarea {
            width: 100%;
            border: 1px solid #ddd;
            padding: 10px;
            resize: none;
            font-size: 14px;
          }
        }
      }
    }
  }
}

.operation-buttons {
  display: flex;
  gap: 5px;
  
  .join-btn {
    background-color: #e8f5e9;
    color: #4cae4f;
    border: 1px solid #c8e6c9;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background-color: #c8e6c9;
    }
  }
  
  .write-btn {
    background-color: #f0f9eb;
    color: #67c23a;
    border: 1px solid #e1f3d8;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background-color: #e1f3d8;
    }
  }
}

.reject-btn {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #fde2e2;
  }
}

.create-consultation-form {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  
  .form-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: #f5f5f5;
  }
  
  .detail-header {
    position: relative;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 15px 20px;
    background-color: #fff;
    border-bottom: 1px solid #e0e0e0;
    z-index: 10;
    
    .current-location {
      color: #666;
    }
    
    .back-button {
      color: #2196f3;
      cursor: pointer;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .green-title {
    color: white;
    background-color: #4cae4f;
    padding: 15px;
    margin: 0 0 20px 0;
    font-weight: bold;
  }
  
  .basic-info-section, .disease-section, .purpose-section, .upload-section {
    background-color: #fff;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &:after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 1px;
      background-color: #e8e8e8;
    }
    
    .patient-detail-btn {
      font-size: 14px;
      background-color: #4cae4f;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      
      &:hover {
        background-color: darken(#4cae4f, 10%);
      }
    }
  }
  
  .info-row {
    display: flex;
    margin-bottom: 15px;
    justify-content: space-between;
  }
  
  .info-item {
    flex: 0 0 32%;
    display: flex;
    align-items: center;
    
    label {
      width: 90px;
      padding-right: 10px;
      font-size: 14px;
      color: #606266;
    }
    
    input, select, textarea {
      flex: 1;
      max-width: 200px;
      height: 36px;
      padding: 0 10px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      font-size: 14px;
      
      &:focus {
        border-color: #4cae4f;
        outline: none;
      }
    }
    
    .gender-selector {
      display: flex;
      gap: 10px;
      
      .gender-option {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 65px;
        height: 36px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        cursor: pointer;
        background-color: #fff;
        position: relative;
        gap: 5px;
        
        &.selected {
          background-color: #b2e5b6;
        }
        
        .check-circle {
          position: static;
          width: 16px;
          height: 16px;
          background-color: #dcdfe6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          
          &.selected {
            background-color: #4cae4f;
          }
          
          .el-icon-check {
            color: #fff;
            font-size: 12px;
          }
        }
        
        .gender-text {
          font-size: 14px;
        }
      }
    }
    
    textarea {
      height: auto;
      padding: 10px;
      max-width: none;
      width: 100%;
    }
    
    .unit {
      margin-left: 5px;
      color: #909399;
      min-width: 40px;
    }
  }
  
  .text-section {
    margin-bottom: 15px;
    
    .text-title {
      font-size: 14px;
      font-weight: normal;
      margin-bottom: 10px;
      color: #606266;
    }
    
    textarea {
      width: 100%;
      max-width: none;
      padding: 10px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      line-height: 1.5;
      
      &:focus {
        border-color: #4cae4f;
        outline: none;
      }
    }
  }
  
  .file-upload {
    .upload-title {
      font-size: 14px;
      font-weight: normal;
      margin-bottom: 10px;
      color: #606266;
    }
    
    .upload-area {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 10px;
    }
    
    .upload-item {
      width: 120px;
      height: 120px;
      background-color: #f8f8f8;
      border: 1px dashed #dcdfe6;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      
      &:hover {
        border-color: #4cae4f;
      }
      
      .upload-placeholder {
        color: #c0c4cc;
        font-size: 28px;
      }
      
      .file-preview {
        width: 100%;
        height: 100%;
        position: relative;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
        }
        
        .file-delete {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 20px;
          height: 20px;
          background-color: #f56c6c;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
        }
      }
    }
    
    .upload-hint {
      color: #909399;
      font-size: 12px;
    }
  }
  
  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding: 20px 0;
  }
  
  .save-btn, .cancel-btn {
    min-width: 120px;
    height: 40px;
    font-size: 14px;
    border-radius: 4px;
    border: 1px solid;
    cursor: pointer;
  }
  
  .save-btn {
    background-color: #4cae4f;
    color: #fff;
    border-color: #4cae4f;
    
    &:hover {
      background-color: #45a049;
    }
  }
  
  .cancel-btn {
    background-color: #fff;
    color: #f56c6c;
    border-color: #f56c6c;
    
    &:hover {
      background-color: #fef0f0;
    }
  }
}

.expert-selection {
  padding: 20px;
  background-color: #f5f5f5;
  flex: 1;
  overflow-y: auto;
  
  .search-section {
    background-color: #fff;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    
    .search-input {
      display: flex;
      margin-bottom: 15px;
      
      input {
        flex: 1;
        height: 36px;
        padding: 0 10px;
        border: 1px solid #dcdfe6;
        border-radius: 4px 0 0 4px;
        
        &:focus {
          outline: none;
          border-color: #4cae4f;
        }
      }
      
      .search-btn {
        background-color: #4cae4f;
        color: white;
        border: none;
        border-radius: 0 4px 4px 0;
        padding: 0 15px;
        cursor: pointer;
        
        &:hover {
          background-color: #45a049;
        }
      }
    }
    
    .filter-options {
      display: flex;
      gap: 20px;
      
      .filter-item {
        display: flex;
        align-items: center;
        
        .label {
          margin-right: 10px;
          color: #606266;
        }
        
        select, input {
          height: 36px;
          padding: 0 10px;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          margin-right: 10px;
          
          &:focus {
            outline: none;
            border-color: #4cae4f;
          }
        }
        
        .search-btn {
          background-color: #4cae4f;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0 15px;
          height: 36px;
          cursor: pointer;
          
          &:hover {
            background-color: #45a049;
          }
        }
      }
    }
  }
  
  .experts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }
  
  .expert-card {
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    background-color: #fff;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: 1px solid #eaeaea;
    
    &.selected {
      border: 1px solid #1ce8a0;
      background-color: #f9fffc;
    }
  }
  
  .expert-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .expert-avatar {
    width: 60px;
    height: 60px;
    
    img {
      width: 100%;
      height: 100%;
      border-radius: 4px;
      object-fit: cover;
    }
  }
  
  .expert-detail {
    .expert-name {
      
      color: #606266;
      
      .expert-title {
        font-size: 34px;
        font-weight: bold;
        color: #333;
        margin-left: 4px;
      }
      .expert-titles {
        background-color: #f0dc76e2;
        color: #e88e20;
        margin-left: 4px;
        padding: 2px 4px;
        border-radius: 4px;
      }
    }
    
    .expert-hospital {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }
  
  .expert-description {
    .description-title {
      font-size: 14px;
      color: #606266;
      margin-bottom: 4px;
    }
    
    .description-content {
      font-size: 12px;
      color: #909399;
      line-height: 1.5;
    }
  }
  
  .selection-action {
    margin-top: 8px;
    
    .select-btn {
      width: 100%;
      padding: 8px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      background-color: #f0f9f6;
      color: #42b983;
      
      &.selected {
        background-color: #e6f7f1;
      }
      
      &:hover {
        opacity: 0.9;
      }
    }
  }
  
  .action-footer {
    display: flex;
    justify-content: center;
    padding: 20px 0;
    
    .next-step-btn {
      min-width: 120px;
      height: 40px;
      background-color: #4cae4f;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      
      &:hover {
        background-color: #45a049;
      }
      
      &:disabled {
        background-color: #c0c4cc;
        cursor: not-allowed;
      }
    }
  }
}

.meeting-chat {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .current-location {
      color: #666;
    }
    
    .header-actions {
      display: flex;
      gap: 10px;
      
      .invite-btn, .setting-btn, .end-btn {
        background-color: #4cae4f;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 15px;
        cursor: pointer;
      }
      
      .invite-btn:hover, .setting-btn:hover, .end-btn:hover {
        background-color: #45a049;
      }
      
      .back-button {
        color: #2196f3;
        cursor: pointer;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
  
  .chat-container {
    display: flex;
    
    .left-sidebar {
      width: 250px;
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      
      .current-consultation {
        margin-bottom: 20px;
        
        .current-header {
          background-color: #4cae4f;
          color: white;
          padding: 10px;
          text-align: center;
          font-weight: normal;
          font-size: 14px;
        }
        
        .current-patient {
          padding: 15px;
          background-color: white;
          color: #333;
          border-left: 4px solid #4cae4f;
          
          .patient-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          
          .patient-info, .patient-time {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
          }
          
          .patient-link {
            font-size: 12px;
            color: #4cae4f;
            cursor: pointer;
            margin-top: 15px;
            border-top: 1px solid #eee;
            padding-top: 10px;
            
            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
      
      .waiting-list {
        .waiting-header {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          border-left: 4px solid #4cae4f;
          background-color: white;
          
          .waiting-title {
            font-weight: bold;
            color: #333;
            font-size: 14px;
          }
          
          .waiting-count {
            color: #999;
            font-size: 12px;
          }
        }
        
        .waiting-items {
          .waiting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 10px;
            border-bottom: 1px solid #eee;
            background-color: white;
            cursor: pointer;
            
            &:hover {
              background-color: #f9f9f9;
            }
            
            .item-left {
              .patient-name {
                font-size: 14px;
                color: #333;
                margin-bottom: 5px;
              }
              
              .initiator {
                font-size: 12px;
                color: #999;
                margin-bottom: 5px;
              }
              
              .wait-time {
                font-size: 12px;
                color: #f56c6c;
                font-weight: bold;
              }
            }
            
            .item-right {
              color: #ccc;
            }
          }
          
          .view-more {
            text-align: center;
            padding: 10px;
            color: #999;
            font-size: 12px;
            background-color: white;
            cursor: pointer;
            
            &:hover {
              color: #4cae4f;
            }
          }
          
          .empty-waiting {
            text-align: center;
            padding: 20px;
            color: #999;
            font-size: 13px;
            background-color: white;
          }
        }
      }
    }
    
    
    .participants-sidebar {
      width: 250px;
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      
      .participants-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        
        .header-title {
          font-weight: bold;
          color: #333;
        }
      }
      
      .participants-list {
        .participant {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          
          .participant-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            margin-right: 10px;
          }
          
          .participant-name {
            font-size: 14px;
            color: #606266;
          }
        }
      }
    }
  }
}

.waiting-status, .in-progress-status, .completed-status, .cancelled-status {
  padding: 20px;
  text-align: center;
  
  .wait-time {
    font-size: 18px;
    font-weight: bold;
    color: #f56c6c;
    margin-bottom: 10px;
  }
  
  .waiting-text {
    color: #666;
    font-size: 14px;
  }
  
  .in-progress-text {
    font-size: 16px;
    font-weight: bold;
    color: #409eff;
    margin-bottom: 10px;
  }
  
  .enter-meeting {
    display: inline-block;
    padding: 6px 16px;
    background-color: #409eff;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: #66b1ff;
    }
  }
  
  .completed-text {
    font-size: 16px;
    font-weight: bold;
    color: #67c23a;
    margin-bottom: 8px;
  }
  
  .completed-time {
    color: #666;
    font-size: 14px;
  }
  
  .cancelled-text {
    font-size: 16px;
    font-weight: bold;
    color: #909399;
  }
}

.in-progress-status {
  cursor: pointer;
  padding: 20px;
  border-radius: 4px;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #f0f9ff;
  }
}

.rejection-reason {
  margin-top: 20px;
  
  .rejection-title {
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .rejection-content {
    textarea {
      width: 100%;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      padding: 10px;
      resize: none;
      
      &:focus {
        outline: none;
        border-color: #409eff;
      }
    }
  }
}

.search-input-wrapper {
  position: relative;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.search-result-item {
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f0f9eb;
  }
}

.patient-detail-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  
  .popup-content {
    width: 800px;
    max-width: 90%;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
    
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-bottom: 1px solid #e0e0e0;
      
      h3 {
        margin: 0;
        font-size: 18px;
      }
      
      .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #999;
        
        &:hover {
          color: #333;
        }
      }
    }
    
    .popup-body {
      padding: 20px;
    }
  }
}

.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.ac {
  align-items: center;
}

.row-gap-16 {
  row-gap: 16px;
}

.item-label {
  width: 70px;
  font-size: 14px;
  color: #9A9A9A;
}

.item-value {
  font-size: 14px;
  color: #474747;
}

.patient-component-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    padding: 15px 20px;
    background-color: #fff;
    border-bottom: 1px solid #e0e0e0;
    
    .current-location {
      color: #666;
    }
    
    .back-button {
      color: #2196f3;
      cursor: pointer;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>



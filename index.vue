<template>
  <div class="flex1 flex overflow-hidden please-container">
    <div class="right-sidebar">
      <!-- 当前会诊信息 -->
      <div class="current-consultation">
        <div class="current-header">正在会诊中</div>
        <div class="current-patient" v-if="currentConsultation">
          <div class="patient-name">{{ currentConsultation.patientName }}</div>
          <div class="patient-info">发起人：{{ currentConsultation.requestingDoctorName }}</div>
          <div class="patient-time">{{ formatConsultationTime(currentConsultation.startTime, currentConsultation.endTime,true) }}</div>
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
          <span class="waiting-count">今日共{{ waitingList.length }}名</span>
        </div>
        
        <div class="waiting-items">
          <div class="waiting-item" v-for="(item, index) in waitingList" :key="index" @click="viewPatientDetail(findConsultationByRecordId(item.recordId))">
            <div class="item-left">
              <div class="patient-name">{{ item.patientName }}</div>
              <div class="initiator">发起人 | <span class="orange-text">{{ item.status }}</span></div>
            </div>
            <div class="item-right">
              <i class="el-icon-arrow-right"></i>
            </div>
          </div>
          <div class="view-more" v-if="waitingList.length > 10" @click="handleViewMore">点击查看更多</div>
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
              待确认
            </div>
            <div 
              class="tab-item" 
              :class="{ active: activeStatus === 'consultation' }"
              @click="handleStatusChange({ name: 'consultation' })"
            >
            待会诊
              <!--  ({{ consultationCount || 0 }}) -->
            </div>
            <div 
              class="tab-item" 
              :class="{ active: activeStatus === 'inProgress' }"
              @click="handleStatusChange({ name: 'inProgress' })"
            >
              正在会诊 
            </div>
            <div 
              class="tab-item" 
              :class="{ active: activeStatus === 'completed' }"
              @click="handleStatusChange({ name: 'completed' })"
            >
              已会诊
            </div>
            <div 
              class="tab-item" 
              :class="{ active: activeStatus === 'cancelled' }"
              @click="handleStatusChange({ name: 'cancelled' })"
            >
              已取消
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
                <td>{{ formatDate(item.createTime) }}</td>
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
                      <button class="view-btn" @click="handleView(item)">查看</button>
                      <button v-if="approved === false" class="reject-btn" @click="handleShowRejection(item)">医生已拒绝</button>
                    </template>
                    
                    <!-- 已拒绝状态 -->
                    <template v-else-if="item.consultationStatus === 3">
                      <button class="view-btn" @click="handleView(item)">查看</button>
                      <button v-if="approved === false" class="reject-btn" @click="handleShowRejection(item)">医生已拒绝</button>
                      <button class="delete-btn" @click="handleDelete(item)">删除</button>
                    </template>
                    
                    <!-- 待确认状态 -->
                    <template v-else-if="item.consultationStatus === 0 && item.approved === false">
                      <button class="view-btn" @click="handleView(item)">查看</button>
                      <button class="accept-btn" @click="handleAccept(item)">接受</button>
                      <button class="reject-btn" @click="handleReject(item)">拒绝</button>
                      <button class="cancel-btn" @click="handleCancel(item)">取消</button>
                    </template>
                    
                    <!-- 待会诊状态 -->
                    <template v-else-if="item.consultationStatus === 0 && item.approved === true || item.consultationStatus === 1">
                      <button class="view-btn" @click="handleView(item)">查看</button>
                    </template>
                    
                    <!-- 其他状态 -->
                    <template v-else>
                      <button class="view-btn" @click="handleView(item)">查看</button>
                    </template>
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
          <div class="back-button" @click="closePatientDetailXQ">返回上一级</div>
        </div>
        <PatientDetail 
          :patient-info="selectedPatient" 
          @close="closePatientDetailXQ"
        />
      </div>
      
      <!-- 会诊单详情内容 -->
      <div v-if="showPatientDetail&&!showPatientDetailXQ&&!showMeetingChat&&!showCreateConsultation" class="embedded-patient-detail">
        
        <!-- 会诊单详情头部 -->
        <div class="detail-header">
          <div class="current-location">当前位置：病案会诊室 > 查看患者档案</div>
          <div class="back-button" @click="closePatientDetail">返回上一级</div>
        </div>
        
        <div class="detail-content">
          <div class="detail-tabs">
            <div class="tab active">基本信息</div>
            <div class="tab" @click="goToPatientDetailFromTab">查看患者档案信息</div>
          </div>
          
          <div class="info-section">
            <div class="section-title">基本信息</div>
            <div class="basic-info">
              <div class="info-row">
                <div class="info-item">姓名：{{ patientInfo.name || 'XXX' }}</div>
                <div class="info-item">性别：{{ patientInfo.gender || (formData && formData.gender) || '男' }}</div>
                <div class="info-item">年龄：{{ patientInfo.age || (formData && formData.age ? formData.age + '周岁' : '23周岁') }}</div>
                <div class="info-item">身高：{{ patientInfo.height || (formData && formData.height ? formData.height + 'cm' : '177cm') }}</div>
                <div class="info-item">体重：{{ patientInfo.weight || (formData && formData.weight ? formData.weight + 'kg' : '70kg') }}</div>
              </div>
              <div class="info-row" v-if="currentRow && currentRow.recordId">
                <div class="info-item">会诊单号：{{ currentRow.recordId }}</div>
                <div class="info-item">所属租户：{{ currentRow.tenantId }}</div>
                <div class="info-item">创建时间：{{ currentRow.createTime }}</div>
              </div>
            </div>
          </div>
          
          <div class="info-section">
            <div class="section-title">患者主诉</div>
            <div class="section-content">{{ patientInfo.chiefComplaint || (formData && formData.chiefComplaint) || 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' }}</div>
          </div>
          
          <div class="info-section">
            <div class="section-title">体征</div>
            <div class="section-content">{{ patientInfo.physicalSigns || (formData && formData.symptoms) || 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' }}</div>
          </div>
          
          <div class="info-section">
            <div class="section-title">临床诊断</div>
            <div class="section-content">{{ patientInfo.clinicalDiagnosis || (formData && formData.clinicalDiagnosis) || currentRow.disease || 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' }}</div>
          </div>
          
          <div class="info-section">
            <div class="section-title">申请诊断目的</div>
            <div class="section-content">{{ patientInfo.consultationPurpose || (formData && formData.diagnosisPurpose) || 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' }}</div>
          </div>
          
          <div class="info-section">
            <div class="section-title">图片上传</div>
            <div class="upload-section">
              <div class="upload-text">共{{ imageUrls.length }}个文件</div>
              <div class="upload-gallery">
                <div 
                  class="image-item" 
                  v-for="(imgUrl, index) in imageUrls" 
                  :key="index"
                  @click="previewImage(imgUrl)"
                >
                  <img :src="imgUrl" class="consultation-image" alt="会诊图片" />
                </div>
                <div class="image-item" v-if="!imageUrls.length">
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
              <!-- 未提交会诊意见时显示链接 -->
              <div v-if="!hasSubmittedOpinion(currentRow)" class="submit-opinion-link" @click="scrollToOpinionSection">
                去提交会诊意见
              </div>
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
              <div class="doctor-avatar">
                <el-avatar :size="40" :src="userInfo && userInfo.headIcon ? getImageUrl(userInfo.headIcon) : 'https://placehold.co/40'" class="avatar" />
              </div>
              <div class="doctor-info">
                <div class="doctor-name">{{ userInfo.userName || '张三' }} {{ userInfo.title || '主任医师' }}</div>
                <div class="doctor-hospital">{{ userInfo.hospitalName || '武汉医院' }} {{ userInfo.deptName || '影像介入科' }}</div>
              </div>
            </div>
            
            <div class="doctor-remarks">
              <div class="remarks-title">描述：</div>
              <div class="remarks-content">XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</div>
            </div>
            
            <div class="consultation-result">
              <div class="result-title">会诊意见</div>
              <div class="result-content">
                <textarea placeholder="会诊结果反馈会被导出家属的诊疗意见" rows="8" v-model="consultationOpinion"></textarea>
              </div>
              <!-- 已会诊状态下显示提交预览和生成会诊报告按钮 -->
              <div class="consultation-action-buttons" v-if="currentRow && currentRow.consultationStatus === 2">
                <button class="submit-preview-btn" @click="handleSubmitPreview">提交预览</button>
                <button class="generate-report-btn" @click="handleGenerateReport">生成会诊报告</button>
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
                <span class="label">会诊时间</span>
                <el-date-picker
                  v-model="consultationDate"
                  type="date"
                  placeholder="选择会诊日期"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  style="width: 130px;"
                >
                </el-date-picker>
              </div>
              <div class="filter-item">
                <span class="label">时间段</span>
                <el-time-picker
                  v-model="consultationStartTime"
                  format="HH:mm"
                  placeholder="开始时间"
                  value-format="HH:mm"
                  style="width: 100px;"
                >
                </el-time-picker>
                <span style="margin: 0 5px;">至</span>
                <el-time-picker
                  v-model="consultationEndTime"
                  format="HH:mm"
                  placeholder="结束时间"
                  value-format="HH:mm"
                  style="width: 100px;"
                >
                </el-time-picker>
              </div>
            </div>
          </div>
          
          <div class="experts-grid">
            <div v-for="(expert, index) in filteredExperts" :key="index" class="expert-card" :class="{ selected: selectedExperts.includes(expert.id) }">
              <div class="expert-info">
                <div class="expert-avatar">
                  <img :src="expert.avatar || 'https://placehold.co/60'" alt="医生头像">
                </div>
                <div class="expert-detail">
                  <div class="expert-name"><span class="expert-title">{{ expert.name }}</span><span class="expert-titles">{{ expert.title }}</span></div>
                  <div class="expert-hospital">{{ expert.hospitalArea }} {{ expert.department }}</div>
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
              <button class="patient-detail-btn" @click="goToPatientDetailFromTab">
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
                  <div class="file-preview" @click="previewUploadedImage(file.url)">
                    <img :src="file.url" alt="预览图" />
                    <div class="file-delete" @click.stop="removeFile(index)">×</div>
                  </div>
                  <div class="file-name" :title="file.name">{{ file.name }}</div>
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
import define from '@/utils/define'  // 导入define模块
// 导入模拟数据
import mockData from '@/mock/consultation.json'
import patientData from '@/mock/patient.json'
import patientSearchData from '@/mock/patientSearch.json'
import doctorsData from '@/mock/doctors.json' // 导入医生数据

// 导入会诊相关API
import { 
  getFormByFormId, 
  getReportByFormId, 
  updateForm, 
  createConsultation, 
  doctorDecision, 
  patientDecision, 
  queryConsultationPage, 
  queryDoctorRefuseReasons,
  getConsultationById,
  updateConsultation,
  deleteConsultation,
  submitConsultationOpinion
} from '@/api/consultation'

// 在script标签顶部添加jspdf和html2canvas的导入
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { mapGetters } from 'vuex'

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
      define, // 添加define到组件数据中
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
      participatingDoctors: [], // 存储已构建的参与医生完整信息
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
      consultationFormDetails: {},
      consultationReport: {},
      consultationOpinion: '',
      consultationDate: '',
      consultationStartTime: '',
      consultationEndTime: '',
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
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
    // 获取表单数据，无论它存储在哪个位置
    formData() {
      if (!this.currentRow) return null;
      
      // 只使用consultationFormEntity
      if (this.currentRow.consultationFormEntity) {
        return this.currentRow.consultationFormEntity;
      }
      
      return null;
    },
    // 获取图片URL数组
    imageUrls() {
      if (!this.formData) return [];
      
      return this.formData.imageUrls || [];
    },
    // 实时计算各状态数量
    specialCount() {
      // 获取当前登录的用户名
      const currentUser = this.$storage.getItem('loginName') || '张医生';
      
      // 先筛选出当前用户作为发起人的会诊记录
      const userConsultations = this.mockData.filter(item => 
        item.requestingDoctorName === currentUser
      );
      
      // 再从中筛选出待确认的记录
      return userConsultations.filter(item => 
        item.consultationStatus === 0 && item.approved === false
      ).length;
    },
    consultationCount() {
      // 获取当前登录的用户名
      const currentUser = this.$storage.getItem('loginName') || '张医生';
      
      // 先筛选出当前用户作为发起人的会诊记录
      const userConsultations = this.mockData.filter(item => 
        item.requestingDoctorName === currentUser
      );
      
      // 再从中筛选出待会诊的记录（不包括会诊中的记录）
      return userConsultations.filter(item => 
        (item.consultationStatus === 0 && item.approved === true) || 
        item.consultationStatus === 1
      ).length;
    },
    completedCount() {
      // 获取当前登录的用户名
      const currentUser = this.$storage.getItem('loginName') || '张医生';
      
      // 先筛选出当前用户作为发起人的会诊记录
      const userConsultations = this.mockData.filter(item => 
        item.requestingDoctorName === currentUser
      );
      
      // 再从中筛选出已会诊的记录
      return userConsultations.filter(item => 
        item.consultationStatus === 2
      ).length;
    },
    cancelledCount() {
      // 获取当前登录的用户名
      const currentUser = this.$storage.getItem('loginName') || '张医生';
      
      // 先筛选出当前用户作为发起人的会诊记录
      const userConsultations = this.mockData.filter(item => 
        item.requestingDoctorName === currentUser
      );
      
      // 再从中筛选出已取消的记录
      return userConsultations.filter(item => 
        item.consultationStatus === 3
      ).length;
    },
    inProgressCount() {
      // 获取当前登录的用户名
      const currentUser = this.$storage.getItem('loginName') || '张医生';
      
      // 先筛选出当前用户作为发起人的会诊记录
      const userConsultations = this.mockData.filter(item => 
        item.requestingDoctorName === currentUser
      );
      
      // 再从中筛选出正在会诊的记录
      return userConsultations.filter(item => 
        item.consultationStatus === 4
      ).length;
    }
  },
  created() {
    // 初始化模拟数据和配置
    this.updateWaitingList() // 更新等待会诊列表和当前会诊患者
    this.init()
    this.updateStatusCounts()
    
    // 调用接口获取当前用户的会诊记录
    this.loadUserConsultations()

    // 获取当前登录用户信息
    this.getUserInfo()

    // 打印 userInfo 到后台
    console.log('userInfo:', this.userInfo)
    
    // 更详细地打印 userInfo 所有属性
    console.log('===== 用户信息详细打印 =====')
    if (this.userInfo) {
      console.log('用户ID:', this.userInfo.userId)
      console.log('用户名:', this.userInfo.userName)
      console.log('用户账号:', this.userInfo.userAccount)
      console.log('组织ID:', this.userInfo.organizeId)
      console.log('组织名称:', this.userInfo.organizeName)
      console.log('部门ID:', this.userInfo.departmentId)
      console.log('部门名称:', this.userInfo.departmentName)
      console.log('职位ID:', this.userInfo.positionId)
      console.log('职位名称:', this.userInfo.positionName)
      console.log('手机号:', this.userInfo.mobilePhone)
      console.log('邮箱:', this.userInfo.email)
      console.log('头像:', this.userInfo.headIcon)
      console.log('角色ID:', this.userInfo.roleIds)
      console.log('角色名称:', this.userInfo.roleName)
      console.log('是否管理员:', this.userInfo.isAdministrator)
      console.log('公司ID:', this.userInfo.companyId)
      console.log('上次登录时间:', this.userInfo.prevLoginTime)
      console.log('上次登录IP:', this.userInfo.prevLoginIPAddress)
      
      // 打印完整 userInfo 对象（格式化后）
      console.log('完整 userInfo 对象:')
      console.log(JSON.stringify(this.userInfo, null, 2))
    } else {
      console.log('userInfo 未获取到')
    }
    console.log('===== 用户信息打印结束 =====')
  },
  mounted() {
    // 在组件挂载后确保数据已加载
    this.$nextTick(() => {
      // 设置定时器，每秒更新等待会诊列表时间
      this.waitingListTimer = setInterval(() => {
        this.updateWaitingListTimes()
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
      // 使用真实API替换模拟数据
      return queryConsultationPage(params)
    },
    apiAdd(params) {
      // 使用真实API替换模拟请求
      return createConsultation(params)
    },
    apiUpdate(params) {
      // 使用真实API替换模拟请求
      return updateForm(params)
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
      this.expertAvailableDate = '';
      this.selectedExperts = []; // 清空已选专家
      this.filteredExperts = []; // 清空专家列表
      
      // 初始加载专家数据
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
      console.log('查看详情:', JSON.stringify(row, null, 2));
      
      if (!row || !row.recordId) {
        this.$message.error('无法查看详情：无效的会诊记录');
        return;
      }
      
      // 强制预先设置showPatientDetail为true，确保即使API调用有问题也能打开详情
      this.showPatientDetail = true;
      // 同时确保其他显示标志为false
      this.showPatientDetailXQ = false;
      this.showMeetingChat = false;
      this.showCreateConsultation = false;
      
      // 调用新方法获取会诊详情
      this.fetchConsultationDetail(row.recordId).catch(error => {
        console.error('获取会诊详情失败:', error);
        // 如果API调用失败，使用备用方法
            this.handleDetailFallback(row);
      });
    },
    
    // 从表单数据更新患者信息
    updatePatientInfoFromForm(formData) {
      if (!formData) return;
      
      // 补充患者信息
      if (formData.patientName) this.patientInfo.name = formData.patientName;
      if (formData.gender) this.patientInfo.gender = formData.gender;
      if (formData.age) this.patientInfo.age = formData.age;
      if (formData.phone) this.patientInfo.phone = formData.phone;
      if (formData.chiefComplaint) this.patientInfo.chiefComplaint = formData.chiefComplaint;
      if (formData.clinicalDiagnosis) this.patientInfo.clinicalDiagnosis = formData.clinicalDiagnosis;
      if (formData.physicalSigns) this.patientInfo.physicalSigns = formData.physicalSigns;
      if (formData.consultationPurpose) this.patientInfo.consultationPurpose = formData.consultationPurpose;
    },
    
    // 使用本地数据的备用查看详情方法
    handleDetailFallback(row) {
      console.log('使用本地数据查看详情');
      this.currentRow = { ...row };
      
      // 获取患者详情
      if (row.patientId) {
        this.fetchPatientInfo(row.patientId);
      }
      
      // 确保设置showPatientDetail为true
      this.showPatientDetail = true;
      // 同时确保其他标志为false
      this.showPatientDetailXQ = false;
      this.showMeetingChat = false;
      this.showCreateConsultation = false;
      console.log('备用方法设置显示标志：showPatientDetail=true，其他=false');
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
      // 重置页码
      this.currentPage = 1;
      
      console.log('searchQuery', this.searchQuery);
      console.log('activeStatus', this.activeStatus);
      console.log('statusCode', this.getStatusCode(this.activeStatus));
      console.log('currentPage', this.currentPage);
      console.log('pageSize', this.pageSize);
      
      // 调用分页查询接口，传入patientName参数
      const queryParams = {
        current: this.currentPage,
        size: this.pageSize,
        requestingDoctorName: this.searchQuery || '',
        consultationStatus: this.getStatusCode(this.activeStatus)
      };
      
      // 对于待确认和待会诊状态，添加approved参数
      if (this.activeStatus === 'special') {
        queryParams.consultationStatus = 0;
      } else if (this.activeStatus === 'consultation') {
        // 确保状态码正确设置
        queryParams.consultationStatus = 1;
      }
      
      console.log('最终查询参数:', queryParams);
      
      // 显示加载中提示
      const loading = this.$loading({
        lock: true,
        text: '加载数据中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      
      // 调用分页查询API
      queryConsultationPage(queryParams).then(res => {
        // 关闭加载提示
        loading.close();
        
        if (res.code === 200 && res.data) {
          // 更新表格数据
          this.tableData = res.data.records || [];
          // 更新分页信息
          this.total = res.data.total || 0;
          this.currentPage = res.data.current || 1;
          this.pageSize = res.data.size || 12;
        } else {
          this.$message.error(res.msg || '查询会诊记录失败');
          // 使用模拟数据作为备用
          this.handleQueryFallback();
        }
      }).catch(error => {
        // 关闭加载提示
        loading.close();
        
        console.error('查询会诊记录错误:', error);
        this.$message.error('查询会诊记录失败: ' + (error.message || '未知错误'));
        
        // 调用备用方法，使用模拟数据
        this.handleQueryFallback();
      });
    },
    handleDateChange() {
      // 暂时不处理日期变化
    },
    handleQuery() {
      // 重置页码
      this.currentPage = 1;
      
      // 格式化日期，添加时间部分
      let formattedStartDate = '';
      let formattedEndDate = '';
      
      if (this.startDate) {
        formattedStartDate = this.startDate + ' 00:00:00';
      }
      
      if (this.endDate) {
        formattedEndDate = this.endDate + ' 23:59:59';
      }
      
      console.log('查询日期范围:', formattedStartDate, '至', formattedEndDate);
      
      // 构建查询参数
      const queryParams = {
        current: this.currentPage,
        size: this.pageSize,
        requestingDoctorName: this.searchQuery || '',
        consultationStatus: this.getStatusCode(this.activeStatus)
      };
      
      // 添加日期范围参数
      if (formattedStartDate) {
        queryParams.startTime = formattedStartDate;
      }
      
      if (formattedEndDate) {
        queryParams.endTime = formattedEndDate;
      }
      
      // 对于待确认和待会诊状态，设置正确的状态码
      if (this.activeStatus === 'special') {
        queryParams.consultationStatus = 0;
      } else if (this.activeStatus === 'consultation') {
        queryParams.consultationStatus = 1;
      }
      
      console.log('查询参数:', queryParams);
      
      // 显示加载中提示
      const loading = this.$loading({
        lock: true,
        text: '加载数据中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      
      // 调用分页查询API
      queryConsultationPage(queryParams).then(res => {
        // 关闭加载提示
        loading.close();
        
        if (res.code === 200 && res.data) {
          // 更新表格数据
          this.tableData = res.data.records || [];
          // 更新分页信息
          this.total = res.data.total || 0;
          this.currentPage = res.data.current || 1;
          this.pageSize = res.data.size || 12;
        } else {
          this.$message.error(res.msg || '查询会诊记录失败');
          // 使用模拟数据作为备用
          this.handleQueryFallback();
        }
      }).catch(error => {
        // 关闭加载提示
        loading.close();
        
        console.error('查询会诊记录错误:', error);
        this.$message.error('查询会诊记录失败: ' + (error.message || '未知错误'));
        
        // 调用备用方法，使用模拟数据
        this.handleQueryFallback();
      });
    },
    
    // 将状态标签转换为API对应的状态码
    getStatusCode(statusName) {
      const statusCodeMap = {
        'special': 0,    // 待确认
        'consultation': 1,  // 待会诊（不含会诊中）
        'inProgress': 4,  // 正在会诊
        'completed': 2,   // 已会诊
        'cancelled': 3    // 已取消
      };
      return statusCodeMap[statusName] !== undefined ? statusCodeMap[statusName] : null;
    },
    
    // 使用模拟数据的备用查询方法
    handleQueryFallback() {
      console.log('使用模拟数据作为备用');
      
      // 获取当前登录的用户名
      const currentUser = this.$storage.getItem('loginName') || '张医生'; // 使用登录账号名，如果获取不到则使用默认值
      console.log('currentUser', this.$storage.getItem('loginName'));
      let filteredData = this.mockData.filter(item => 
        item.requestingDoctorName === currentUser
      );
      
      // 如果有开始日期和结束日期，进行日期筛选
      if (this.startDate && this.endDate) {
        const startDate = new Date(this.startDate);
        const endDate = new Date(this.endDate);
        endDate.setHours(23, 59, 59); // 设置为当天的最后一秒
        
        filteredData = filteredData.filter(item => {
          const consultationDate = new Date(item.startTime.split(' ')[0]);
          return consultationDate >= startDate && consultationDate <= endDate;
        });
      }
      
      // 如果有搜索字段，进行多字段模糊搜索
      if (this.searchQuery) {
        const searchQuery = this.searchQuery.toLowerCase();
        filteredData = filteredData.filter(item => {
          return (
            (item.patientName && item.patientName.toLowerCase().includes(searchQuery)) || 
            (item.requestingDoctorName && item.requestingDoctorName.toLowerCase().includes(searchQuery)) ||
            (item.participatingDoctors && item.participatingDoctors.some(doctor => 
              doctor.doctorName && doctor.doctorName.toLowerCase().includes(searchQuery)
            ))
          );
        });
      }
      
      // 根据状态进一步筛选
      filteredData = this.filterUserConsultations(filteredData);
      
      // 更新分页后的数据
      this.updatePaginatedData(filteredData);
    },
    
    // 根据状态筛选数据
    getFilteredDataByStatus(status) {
      // 根据日期和搜索字段筛选数据
      let filteredData = [...this.mockData];
      
      // 如果有开始日期和结束日期，进行日期筛选
      if (this.startDate && this.endDate) {
        const startDate = new Date(this.startDate);
        const endDate = new Date(this.endDate);
        endDate.setHours(23, 59, 59); // 设置为当天的最后一秒
        
        filteredData = filteredData.filter(item => {
          const consultationDate = new Date(item.startTime.split(' ')[0]);
          return consultationDate >= startDate && consultationDate <= endDate;
        });
      }
      
      // 如果有搜索字段，进行多字段模糊搜索
      if (this.searchQuery) {
        const searchQuery = this.searchQuery.toLowerCase();
        filteredData = filteredData.filter(item => {
          return (
            (item.patientName && item.patientName.toLowerCase().includes(searchQuery)) || 
            (item.requestingDoctorName && item.requestingDoctorName.toLowerCase().includes(searchQuery)) ||
            (item.participatingDoctors && item.participatingDoctors.some(doctor => 
              doctor.doctorName && doctor.doctorName.toLowerCase().includes(searchQuery)
            ))
          );
        });
      }
      
      // 根据状态进行筛选
      switch (status) {
        case 'special': // 待确认
          return filteredData.filter(item => item.consultationStatus === 0 && item.approved === false);
        case 'consultation': // 待会诊
          return filteredData.filter(item => 
          (item.consultationStatus === 0 && item.approved === true) || 
            item.consultationStatus === 1
          );
        case 'inProgress': // 正在会诊
          return filteredData.filter(item => item.consultationStatus === 4);
        case 'completed': // 已会诊
          return filteredData.filter(item => item.consultationStatus === 2);
        case 'cancelled': // 已取消
          return filteredData.filter(item => item.consultationStatus === 3);
        default:
          return filteredData;
      }
    },
    handleStatusChange(tab) {
      this.activeStatus = tab.name;
      this.currentPage = 1;
      
      // 重新加载当前用户的会诊记录，应用新的状态过滤
      this.loadUserConsultations();
    },
    // 根据状态筛选数据
    filterDataByStatus(status) {
      const filteredData = this.getFilteredDataByStatus(status)
      this.updatePaginatedData(filteredData)
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
        this.currentPage--;
        this.loadUserConsultations();
      }
    },
    // 下一页
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.loadUserConsultations();
      }
    },
    handleView(row) {
      // 实现查看详情逻辑
      console.log('开始查看详情，当前showPatientDetail=', this.showPatientDetail);
      
      // 确保只有showPatientDetail为true，其他都为false
      this.showPatientDetailXQ = false;
      this.showMeetingChat = false;
      this.showCreateConsultation = false;
      
      this.handleDetail(row);
      // 不再在这里设置showPatientDetail，而是让processConsultationData中设置
      // setTimeout(() => {
      //   this.showPatientDetail = true;
      // }, 300);
 
      console.log('已开始加载详情，请等待...',this.showPatientDetail);
      
      // 添加一个延迟检查，确保最终设置成功
      setTimeout(() => {
        console.log('2秒后检查showPatientDetail=', this.showPatientDetail);
        if (!this.showPatientDetail) {
          console.warn('showPatientDetail在2秒后仍未设置为true，强制设置');
        this.showPatientDetail = true;
          this.showPatientDetailXQ = false;
          this.showMeetingChat = false;
          this.showCreateConsultation = false;
        }
      }, 2000);
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
    formatConsultationTime(startTime, endTime,pd=false) {
      if (!startTime || !endTime) return '';
      
      // 显示完整的会诊时间，包括年月日
      const dateStr = startTime.split(' ')[0].replace(/-/g, '/')
      
      // 截取时间部分
      const startTimeStr = startTime.substr(11, 5);
      const endTimeStr = endTime.substr(11, 5);
      if(pd){
        return `${startTimeStr}-${endTimeStr}`;
      }else{
      return `${dateStr} ${startTimeStr}-${endTimeStr}`;
      }
    },
    // 更新各状态计数 (仅用于手动触发更新)
    updateStatusCounts() {
      // 由于现在使用计算属性，此方法可以留空或用于其他用途
      // 如需要手动触发视图更新可以使用 this.$forceUpdate()
    },
    // 显示患者档案详情
    viewPatientDetail(row) {
      // 处理患者详情
      if (row && row.recordId) {
        this.fetchConsultationDetail(row.recordId).then(() => {
          // 获取成功后的处理已经在processConsultationData中完成
          // showPatientDetail已在processConsultationData中设置为true
        }).catch(() => {
          // 获取失败使用备用方法
          this.handleDetailFallback(row);
          // 备用方法里没有设置showPatientDetail，需要手动设置
        this.showPatientDetail = true;
        });
      } else {
        this.$message.error('无法查看详情：无效的会诊记录');
      }
    },
    // 关闭患者档案详情
    closePatientDetail() {
      this.showPatientDetail = false
    },
    // 更新等待会诊列表和当前会诊患者
    updateWaitingList() {
      // 获取当前时间和今天结束时间
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      const currentTimeStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      const endOfDayStr = `${year}-${month}-${day} 23:59:59`;
      
      console.log('获取等待会诊列表，时间范围:', currentTimeStr, '至', endOfDayStr);
      
      // 先查询会诊中的记录
      
      this.fetchConsultationsInProgress(currentTimeStr, endOfDayStr).then(inProgressConsultations => {
        // 设置当前会诊
        this.currentConsultation = inProgressConsultations.length > 0 ? inProgressConsultations[0] : null;
        
        // 再查询待会诊的记录
        this.fetchWaitingConsultations(currentTimeStr, endOfDayStr).then(waitingConsultations => {
          // 格式化等待会诊列表数据
          this.waitingList = waitingConsultations.map(item => {
            // 计算剩余时间
            const startTime = new Date(item.startTime);
            const now = new Date();
            const diffMs = startTime - now;
            
            // 格式化成"00:30:30后开始"格式
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
              patientName: item.patientName,
              status: timeText,
              recordId: item.recordId,
              patientId: item.patientId,
              startTime: item.startTime,
              requestingDoctorName: item.requestingDoctorName
            };
          });
        }).catch(error => {
          console.error('获取待会诊记录错误:', error);
          // 使用本地数据作为备用
          this.updateWaitingListFallback();
        });
      });
    },
    
    // 查询会诊中的记录
    fetchConsultationsInProgress(startTime, endTime) {
      return new Promise((resolve, reject) => {
        // 构建查询参数 - 会诊中
        const inProgressParams = {
          current: 1,
          size: 5, // 只需要少量记录
          startTime: startTime,
          endTime: endTime,
          consultationStatus: 4 // 会诊中
        };
        
        // 调用分页查询API
        queryConsultationPage(inProgressParams).then(res => {
          if (res.code === 200 && res.data) {
            resolve(res.data.records || []);
          } else {
            console.error('获取会诊中记录失败:', res.msg);
            resolve([]);
          }
        }).catch(error => {
          console.error('获取会诊中记录错误:', error);
          reject(error);
        });
      });
    },
    
    // 查询待会诊的记录
    fetchWaitingConsultations(startTime, endTime) {
      return new Promise((resolve, reject) => {
        // 构建查询参数 - 待会诊
        const waitingParams = {
          current: 1,
          size: 10,
          startTime: startTime,
          endTime: endTime,
          consultationStatus: 1 // 待会诊
        };
        
        // 调用分页查询API
        queryConsultationPage(waitingParams).then(res => {
          if (res.code === 200 && res.data) {
            resolve(res.data.records || []);
          } else {
            console.error('获取待会诊记录失败:', res.msg);
            resolve([]);
          }
        }).catch(error => {
          console.error('获取待会诊记录错误:', error);
          reject(error);
        });
      });
    },
    
    // 使用本地数据的备用方法
    updateWaitingListFallback() {
      // 筛选今日会诊的患者（状态为0且已批准，或状态为1，或状态为4）
      const todayConsultations = this.mockData.filter(item => {
        const consultationDate = item.startTime.split(' ')[0];
        const isTodayConsultation = consultationDate === this.todayDate;
        const isWaiting = ((item.consultationStatus === 0 && item.approved === true) || 
                          item.consultationStatus === 1);
        const isInProgress = item.consultationStatus === 4;
        
        return isTodayConsultation && (isWaiting || isInProgress);
      });
      
      // 找出正在会诊的患者（状态为4）
      const currentConsultation = todayConsultations.find(item => item.consultationStatus === 4);
      this.currentConsultation = currentConsultation || null;
      
      // 筛选待会诊的患者（只包含状态0和状态1）
      const waitingPatients = todayConsultations.filter(item => 
        (item.consultationStatus === 0 && item.approved === true) || 
        item.consultationStatus === 1
      );
      
      // 格式化等待会诊列表数据
      this.waitingList = waitingPatients.map(item => {
        // 计算剩余时间
        const startTime = new Date(item.startTime);
        const now = new Date();
        const diffMs = startTime - now;
        
        // 格式化成"00:30:30后开始"格式
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
          patientName: item.patientName,
          status: timeText,
          recordId: item.recordId,
          patientId: item.patientId,
          startTime: item.startTime,
          requestingDoctorName: item.requestingDoctorName
        };
      });
    },
    
    // 查看详情时更新等待会诊列表（模拟实时更新）
    handleDetailWithUpdate(row) {
      console.log('row', row.consultationStatus);
      if (row && row.patientId) {
        console.log('row', row);
        // 查找患者信息并显示详情
        this.handleDetail(row);
        // 不再使用setTimeout设置，而是让processConsultationData设置
      } else {
        this.handleDetail(row);
        // 不再使用setTimeout设置
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
      if (!patientId) return;
      
      console.log('获取患者详情:', patientId);
      
      try {
      // 这里应该是从API获取患者信息
      // 由于API可能不可用，这里使用模拟数据
        const foundPatient = patientSearchData && patientSearchData.patientList ? 
          patientSearchData.patientList.find(p => p.id === patientId || p.pkId === patientId) :
          null;
      
      if (foundPatient) {
        // 更新患者详细信息
            this.patientInfo = {
          ...this.patientInfo,
          name: foundPatient.name || this.patientInfo.name,
          gender: foundPatient.gender || this.patientInfo.gender,
          age: foundPatient.age || this.patientInfo.age,
          phone: foundPatient.phone || this.patientInfo.phone,
          height: foundPatient.height || this.patientInfo.height,
          weight: foundPatient.weight || this.patientInfo.weight,
          idNumber: foundPatient.idNumber || this.patientInfo.idNumber,
          birthDate: foundPatient.birthDate || this.patientInfo.birthDate,
          occupation: foundPatient.occupation || this.patientInfo.occupation,
          maritalStatus: foundPatient.maritalStatus || this.patientInfo.maritalStatus,
          ethnicity: foundPatient.ethnicity || this.patientInfo.ethnicity,
          hometown: foundPatient.hometown || this.patientInfo.hometown,
          hospital: foundPatient.hospitalName || this.patientInfo.hospital,
          dept: foundPatient.dept || this.patientInfo.dept
        };
        } else {
        console.warn('未找到患者信息:', patientId);
          
          // 如果找不到患者信息，尝试使用当前会诊详情中的信息
          if (this.currentRow && this.currentRow.consultationFormEntity) {
            const formData = this.currentRow.consultationFormEntity;
            this.patientInfo = {
              ...this.patientInfo,
              name: this.currentRow.patientName || this.patientInfo.name,
              gender: formData.gender || this.patientInfo.gender,
              age: formData.age || this.patientInfo.age,
              phone: formData.phone || this.patientInfo.phone,
              height: formData.height || this.patientInfo.height,
              weight: formData.weight || this.patientInfo.weight,
              idNumber: formData.documentNumber || this.patientInfo.idNumber,
              birthDate: formData.birthDate || this.patientInfo.birthDate,
              occupation: formData.occupation || this.patientInfo.occupation,
              maritalStatus: formData.maritalStatus || this.patientInfo.maritalStatus,
              ethnicity: formData.ethnicity || this.patientInfo.ethnicity,
              hometown: formData.nativePlace || this.patientInfo.hometown
            };
          }
        }
      } catch (error) {
        console.error('获取患者信息出错:', error);
        // 即使出错也不阻止界面显示
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
      
      // 检查是否达到最大上传数量限制（6个）
      if (this.consultationForm.files.length + files.length > 6) {
        this.$message.warning('最多只能上传6张图片');
        return;
      }
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // 检查文件大小，限制为10MB
        if (file.size > 10 * 1024 * 1024) {
          this.$message.error(`文件 ${file.name} 大小超过10MB限制`);
          continue;
        }
        
        // 检查文件类型，确保是图片
        if (!file.type.startsWith('image/')) {
          this.$message.error(`文件 ${file.name} 不是有效的图片格式`);
          continue;
        }
        
        // 创建FormData对象
        const formData = new FormData();
        formData.append('file', file); // 添加文件参数
        formData.append('module', '会诊单'); // 添加module参数，固定为"会诊单"
        
        // 显示上传中提示 - 确保引用保存在函数作用域内
        let loadingMessage = null;
        try {
          loadingMessage = this.$message({
            message: `正在上传文件: ${file.name}`,
            type: 'info',
            duration: 0
          });
        } catch (err) {
          console.error('创建加载提示失败:', err);
        }
        
        // 直接使用axios发送请求，避免baseURL问题
        // 接口地址: http://1.95.40.88:83/patient/api/file/upload
        const uploadUrl = process.env.NODE_ENV === 'development' 
          ? '/devs/api/file/upload' // 开发环境使用代理
          : 'http://1.95.40.88:83/patient/api/file/upload'; // 生产环境使用完整URL
        
        // 获取token
        const token = this.$store.getters.token || '';
        
        // 定义安全关闭loading的函数
        const safeCloseLoading = () => {
          if (loadingMessage && typeof loadingMessage.close === 'function') {
            try {
              loadingMessage.close();
            } catch (err) {
              console.error('关闭加载提示失败:', err);
            }
          }
        };
        
        // 发送请求 - 使用原生fetch API避免axios的baseURL问题
        fetch(uploadUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': token,
            'zhlx-origin': 'pc'
          }
        })
        .then(response => response.json())
        .then(res => {
          // 关闭上传中提示
          safeCloseLoading();
          
          // 检查响应是否包含必要的数据
          // 有两种可能的成功响应格式：
          // 1. {code: 200, data: {url: '...', fileId: '...'}}
          // 2. 直接返回文件信息对象 {fileName: '...', fileUrl: '...', filePath: '...'}
          
          let fileData = null;
          
          if (res.code === 200 && res.data) {
            // 第一种响应格式
            fileData = {
              url: res.data.url, // 使用服务器返回的URL
              name: file.name,
              fileId: res.data.fileId || res.data.id // 保存文件ID，兼容不同返回格式
            };
          } else if (res.fileUrl || res.filePath) {
            // 第二种响应格式 - 直接返回文件信息
            fileData = {
              url: res.fileUrl || res.filePath, // 使用服务器返回的URL
              name: res.fileName || file.name,
              fileId: res.id || res.fileId // 文件ID可能不存在
            };
          }
          
          if (fileData && fileData.url) {
            // 打印返回的数据，方便调试
            console.log('文件上传成功，返回数据:', res);
            
            // 检查URL是否完整，如果不是完整URL则拼接基础URL
            if (fileData.url && !fileData.url.startsWith('http')) {
              // 使用配置的基础URL或默认URL
              const baseUrl = process.env.VUE_APP_FILE_URL || 'http://1.95.40.88:83';
              fileData.url = `${baseUrl}${fileData.url.startsWith('/') ? '' : '/'}${fileData.url}`;
            }
            
            // 添加到文件列表
            this.consultationForm.files.push(fileData);
            this.$message.success(`文件 ${file.name} 上传成功`);
          } else {
            this.$message.error(`文件 ${file.name} 上传失败: ${res.msg || '服务器返回格式不正确'}`);
            console.error('上传失败，返回数据:', res);
          }
        })
        .catch(error => {
          // 关闭上传中提示
          loadingMessage.close();
          
          console.error('上传失败:', error);
          this.$message.error(`文件 ${file.name} 上传失败: ${error.message || '未知错误'}`);
          
          // 添加本地预览作为备用方案
          const reader = new FileReader();
          reader.onload = (e) => {
            this.consultationForm.files.push({
              url: e.target.result,
              name: file.name,
              isLocalPreview: true // 标记为本地预览
            });
            this.$message.warning(`已切换到本地预览模式: ${file.name}`);
          };
          reader.readAsDataURL(file);
        });
      }
      
      // 清空文件输入框，允许重复选择同一文件
      event.target.value = '';
    },
    removeFile(index) {
      this.consultationForm.files.splice(index, 1);
    },
    saveConsultation() {
      // 检查是否有未完成的上传
      const hasLocalFiles = this.consultationForm.files.some(file => file.isLocalPreview);
      if (hasLocalFiles) {
        this.$confirm('有文件尚未上传到服务器，是否继续?', '提示', {
          confirmButtonText: '继续',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.doSaveConsultation();
        }).catch(() => {
          // 用户取消
        });
      } else {
        this.doSaveConsultation();
      }
    },
    doSaveConsultation() {
      // 构建新建会诊所需数据
      // 使用已设置的会诊开始和结束时间
      let formattedStartTime = this.formattedStartTime;
      let formattedEndTime = this.formattedEndTime;
      
      // 如果没有设置时间，则使用默认时间
      if (!formattedStartTime || !formattedEndTime) {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 1); // 设置为当前时间后一小时
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1); // 持续一小时
      
        formattedStartTime = this.formatDateTime(startTime);
        formattedEndTime = this.formatDateTime(endTime);
      }
      
      // 打印时间参数并确保开始时间小于结束时间
      console.log('会诊开始时间:', formattedStartTime);
      console.log('会诊结束时间:', formattedEndTime);
      
      // 验证时间格式和大小关系
      const startTimeObj = new Date(formattedStartTime);
      const endTimeObj = new Date(formattedEndTime);
      
      console.log('时间比较结果 (开始时间 < 结束时间):', startTimeObj < endTimeObj);
      
      // 如果开始时间大于或等于结束时间，显示警告并自动调整
      if (startTimeObj >= endTimeObj) {
        console.warn('警告: 开始时间不小于结束时间，系统自动调整');
        endTimeObj.setHours(startTimeObj.getHours() + 1);
        formattedEndTime = this.formatDateTime(endTimeObj);
        console.log('调整后的结束时间:', formattedEndTime);
      }

      // 准备参与会诊的医生数据 - 包含完整信息
      const apiParticipatingDoctors = this.participatingDoctors.map(doctor => ({
        doctorId: String(doctor.doctorId), // 确保doctorId是字符串类型
        doctorName: doctor.doctorName,
        avatar: doctor.avatar || '', // 医生头像
        department: doctor.department || '', // 医生部门
        title: doctor.title || '' // 医生职称
      }));
      
      // 处理文件列表，获取服务器返回的fileId和url
      const imageUrls = this.consultationForm.files
        .filter(file => !file.isLocalPreview) // 过滤掉本地预览的文件
        .map(file => {
          // 确保使用正确的URL
          if (file.url) {
            // 确保URL是完整的
            if (!file.url.startsWith('http')) {
              // 使用配置的基础URL或默认URL
              const baseUrl = process.env.VUE_APP_FILE_URL || 'http://1.95.40.88:83';
              return `${baseUrl}${file.url.startsWith('/') ? '' : '/'}${file.url}`;
            }
            return file.url;
          }
          return '';
        })
        .filter(url => url); // 过滤掉空URL
      
      // 收集文件ID，以便后续可能的操作
      const fileIds = this.consultationForm.files
        .filter(file => !file.isLocalPreview && file.fileId) // 过滤掉本地预览的文件和没有fileId的文件
        .map(file => file.fileId);
      
      console.log('图片URL列表:', imageUrls);
      console.log('文件ID列表:', fileIds);
      
      // 获取当前登录用户信息
      const currentUser = this.userInfo.userName || '张医生';
      // 获取当前用户ID和部门信息，可以从存储中获取或者通过API获取
      // const currentUserId = this.userInfo.userId || '44';
      const currentUserId = '44';
      const deptName = this.userInfo.departmentName || '地球保卫科';
      const deptId = this.userInfo.departmentId || '56';
      const tenantId = '25';
      
      // 构建会诊表单数据（新格式）
      const consultationData = {
        patientId: this.$storage.getItem('patientId') || 60, // 将字符串改为数字
        patientName: this.consultationForm.patientName,
        tenantId: Number(tenantId), // 确保为数字
        requestingDeptId: Number(deptId), // 确保为数字
        requestingDeptName: deptName,
        requestingDoctorId: Number(currentUserId), // 确保为数字
        requestingDoctorName: currentUser,
        consultationForm: {
          tenantId: Number(tenantId), // 确保为数字
          name: this.consultationForm.patientName,
          gender: this.consultationForm.gender,
          maritalStatus: this.consultationForm.maritalStatus,
          age: Number(this.consultationForm.age), // 确保为数字
          phone: this.consultationForm.phone,
          documentType: this.consultationForm.idType || 'k',
          documentNumber: this.consultationForm.idNumber || '6%',
          birthDate: this.consultationForm.birthDate,
          height: Number(this.consultationForm.height), // 确保为数字
          weight: Number(this.consultationForm.weight), // 确保为数字
          ethnicity: this.consultationForm.ethnicity || '',
          nativePlace: this.consultationForm.hometown || '',
          occupation: this.consultationForm.occupation || '',
          chiefComplaint: this.consultationForm.chiefComplaint || '',
          clinicalDiagnosis: this.consultationForm.clinicalDiagnosis || '',
          symptoms: this.consultationForm.physicalSigns || '',
          diagnosisPurpose: this.consultationForm.consultationPurpose || '',
          consultationOpinion: '',
          imageUrls: imageUrls
        },
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        participatingDoctors: apiParticipatingDoctors.map(doctor => ({
          doctorId: String(doctor.doctorId), // 确保为字符串
          doctorName: doctor.doctorName,
          avatar: doctor.avatar || '', // 医生头像
          hospitalArea: doctor.hospitalArea || '北京人民医院', // 医生所在医院
          department: doctor.department || '消化内科', // 医生部门
          title: doctor.title || '' // 医生职称
        }))
      };
      
      console.log('提交的会诊数据:', consultationData);
      
      // 以JSON格式漂亮地打印表单数据到浏览器控制台
      console.log('===== 提交的会诊表单数据(JSON格式) =====');
      console.log(JSON.stringify(consultationData, null, 2));
      console.log('===== 会诊表单数据打印结束 =====');
      
      // 显示加载中提示
      const loading = this.$loading({
        lock: true,
        text: '正在提交会诊...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      
      // 调用API创建会诊
      createConsultation(consultationData).then(res => {
        // 关闭加载提示
        loading.close();
        
        // 打印服务器返回的响应数据
        console.log('===== 服务器返回的响应数据(JSON格式) =====');
        console.log(JSON.stringify(res, null, 2));
        console.log('===== 响应数据打印结束 =====');
        
        if (res.code === 200) {
          // 创建成功，展示返回的会诊信息
          const newConsultation = res.data;
          this.$message.success('会诊创建成功');
          
          // 关闭表单
          this.showCreateConsultation = false;
          
          // 确认是否需要立即查看新建的会诊
          this.$confirm('会诊已创建成功，是否立即查看？', '创建成功', {
            confirmButtonText: '立即查看',
            cancelButtonText: '稍后查看',
            type: 'success'
          }).then(() => {
            // 用户选择立即查看，打开详情页
            if (newConsultation && newConsultation.recordId) {
              // 查看新创建的会诊
              this.handleView(newConsultation);
            } else {
              // 刷新列表
              this.handleQuery();
              this.updateWaitingList();
            }
          }).catch(() => {
            // 用户选择稍后查看，刷新列表
            this.handleQuery();
            this.updateWaitingList();
          });
        } else {
          this.$message.error(res.msg || '创建会诊失败');
        }
      }).catch(error => {
        // 关闭加载提示
        loading.close();
        
        // 记录详细错误信息，方便调试
        console.error('创建会诊错误:', error);
        console.error('错误详情:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
          data: consultationData
        });
        
        this.$message.error('创建会诊失败: ' + (error.message || '未知错误'));
        
        // 如果API调用失败，使用模拟数据作为备用方案
        if (confirm('连接服务器失败，是否使用本地模式创建会诊？')) {
          // 生成新的记录ID和患者ID
          const newRecordId = Math.max(...this.mockData.map(item => item.recordId || 0)) + 1;
          const newPatientId = Math.max(...patientData.patientList.map(item => item.id || 0)) + 1;
          
          // 获取当前登录用户信息
          const currentUser = this.userInfo.userName || '张医生';
          const currentUserId = this.userInfo.userId || '44';
          const deptName = this.userInfo.departmentName || '地球保卫科';
          const deptId = this.userInfo.departmentId || '56';
          const tenantId = this.userInfo.organizeId || '25';
          
          // 为本地模式调整participatingDoctors格式
          const localParticipatingDoctors = apiParticipatingDoctors.map(doc => ({
            doctorId: String(doc.doctorId),
            doctorName: doc.doctorName,
            hospitalArea: doc.hospitalArea || '北京人民医院',
            department: doc.department || '消化内科'
          }));
          
          // 构建新的会诊记录（本地模式，与新格式保持一致）
      const newConsultation = {
        recordId: newRecordId,
        patientId: newPatientId,
        patientName: this.consultationForm.patientName,
        consultationStatus: 0, // 待确认
            tenantId: Number(tenantId),
            requestingDeptId: Number(deptId),
            requestingDeptName: deptName,
            requestingDoctorId: Number(currentUserId),
            requestingDoctorName: currentUser,
        startTime: formattedStartTime,
            endTime: formattedEndTime, // 使用可能已经调整过的结束时间
            createdTime: new Date().toISOString(),
        disease: this.consultationForm.clinicalDiagnosis,
        patientGender: this.consultationForm.gender,
        patientAge: `${this.consultationForm.age}岁`,
        approved: false,
            participatingDoctors: localParticipatingDoctors,
            consultationForm: {
              tenantId: Number(tenantId),
              name: this.consultationForm.patientName,
              gender: this.consultationForm.gender,
              maritalStatus: this.consultationForm.maritalStatus,
              age: Number(this.consultationForm.age),
              phone: this.consultationForm.phone,
              documentType: this.consultationForm.idType || 'k',
              documentNumber: this.consultationForm.idNumber || '6%',
              birthDate: this.consultationForm.birthDate,
              height: Number(this.consultationForm.height),
              weight: Number(this.consultationForm.weight),
              ethnicity: this.consultationForm.ethnicity || '',
              nativePlace: this.consultationForm.hometown || '',
              occupation: this.consultationForm.occupation || '',
              chiefComplaint: this.consultationForm.chiefComplaint || '',
              clinicalDiagnosis: this.consultationForm.clinicalDiagnosis || '',
              symptoms: this.consultationForm.physicalSigns || '',
              diagnosisPurpose: this.consultationForm.consultationPurpose || '',
              consultationOpinion: '',
              imageUrls: imageUrls
            }
          };
          
          // 添加到本地数据
        this.mockData.push(newConsultation);
          this.$message.success('已在本地模式创建会诊');
          this.showCreateConsultation = false;
          
          // 询问是否需要立即查看新建的会诊
          this.$confirm('会诊已在本地创建成功，是否立即查看？', '本地创建成功', {
            confirmButtonText: '立即查看',
            cancelButtonText: '稍后查看',
            type: 'success'
          }).then(() => {
            // 用户选择立即查看，打开详情页
            this.handleView(newConsultation);
          }).catch(() => {
            // 用户选择稍后查看，刷新列表
            this.handleQuery();
        this.updateWaitingList();
          });
        }
      });
    },
    searchExperts() {
      // 实现搜索专家的逻辑
      console.log('搜索专家', this.expertSearchQuery, this.expertDepartment, this.expertAvailableDate);
      
      // 从后端获取医生数据
      const doctorName = this.expertSearchQuery || '';
      
      // 显示加载中提示
      const loading = this.$loading({
        lock: true,
        text: '加载专家数据...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      
      // 构建URL - 确保当doctorName为空时使用正确的URL格式
      const url = doctorName ? `/api/user/doctorName/${doctorName}` : '/api/user/doctorName/all';
      console.log('请求URL:', url);
      
      this.$request.get(url).then(res => {
        // 关闭加载提示
        loading.close();
        
        // 输出完整的API响应数据
        console.log('获取到的专家数据(原始):', res);
        
        if (res && Array.isArray(res)) {
          console.log('专家数据数量:', res.length);
          
          // 如果有数据，输出第一条记录的详细信息
          if (res.length > 0) {
            console.log('第一条专家数据详情:', JSON.stringify(res[0], null, 2));
          }
          
          // 转换返回的医生数据为前端需要的格式
          const allExperts = res.map(doctor => ({
            id: doctor.lid,
            name: doctor.lrealname,
            title: doctor.doctorTitle || '医师',
            hospitalArea: doctor.hospital || '未知医院',
            department: doctor.department || '未知科室',
            description: doctor.lsignature || '暂无描述', // 使用lsignature代替ldescription
            avatar: doctor.lheadicon ? this.getImageUrl(doctor.lheadicon) : 'https://placehold.co/60'
          }));
          
          console.log('转换后的专家数据:', allExperts);
          
          // 根据科室筛选
          this.filteredExperts = allExperts.filter(expert => {
            // 筛选科室
            const deptMatch = !this.expertDepartment || 
              expert.department === this.expertDepartment;
            
            // 日期筛选（如果需要可以添加后端实现）
            const dateMatch = true;
            
            return deptMatch && dateMatch;
          });
          
          console.log('筛选后的专家数据:', this.filteredExperts);
          
          // 如果没有结果，显示提示
          if (this.filteredExperts.length === 0) {
            this.$message.warning('没有找到符合条件的专家');
          }
        } else {
          console.error('获取专家列表返回格式异常:', res);
          this.$message.error('获取专家列表返回格式异常');
          this.filteredExperts = [];
        }
      }).catch(err => {
        // 关闭加载提示
        loading.close();
        
        console.error('获取专家列表失败:', err);
        console.error('错误详情:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        this.$message.error('获取专家列表失败: ' + (err.message || '未知错误'));
        
        // 如果API调用失败，使用本地数据作为备用方案
        if (confirm('获取专家数据失败，是否使用本地数据?')) {
          // 使用导入的医生数据作为备用
      const allExperts = doctorsData.map(doctor => ({
        id: doctor.lid,
        name: doctor.lrealname,
        title: doctor.doctorTitle || '医师',
        hospitalArea: doctor.hospital || '未知医院',
        department: doctor.department || '未知科室',
        description: doctor.lsignature || '暂无描述' // 使用lsignature代替ldescription
      }));
          
          
          console.log('使用本地数据:', allExperts);
      
      // 根据搜索条件筛选专家
      this.filteredExperts = allExperts.filter(expert => {
        // 筛选姓名或专业
        const nameMatch = !this.expertSearchQuery || 
          expert.name.includes(this.expertSearchQuery) || 
          expert.description.includes(this.expertSearchQuery);
        
        // 筛选科室
        const deptMatch = !this.expertDepartment || 
          expert.department === this.expertDepartment;
        
            return nameMatch && deptMatch;
      });
      
          console.log('筛选后的本地专家数据:', this.filteredExperts);
          
      if (this.filteredExperts.length === 0) {
            this.$message.warning('没有找到符合条件的专家');
        // 重置为所有专家
        this.filteredExperts = allExperts;
      }
        }
      });
    },
    toggleExpertSelection(id) {
      const expert = this.filteredExperts.find(e => e.id === id);
      if (!expert) return;
      
      // 检查是否已选择该专家
      const existingIndex = this.selectedExperts.findIndex(expertId => expertId === id);
      
      if (existingIndex >= 0) {
        // 如果已选择，则移除
        this.selectedExperts = this.selectedExperts.filter(i => i !== id);
      } else {
        // 如果未选择，则添加
        this.selectedExperts.push(id);
      }
    },
    proceedToConsultationForm() {
      // 实现进入会诊信息表单的逻辑
      console.log('进入会诊信息表单', this.selectedExperts);
      console.log('选择的会诊日期:', this.consultationDate);
      console.log('选择的开始时间:', this.consultationStartTime);
      console.log('选择的结束时间:', this.consultationEndTime);
      
      // 构建选择的专家信息数组，保存更多医生信息
      this.participatingDoctors = this.selectedExperts.map(expertId => {
        const expert = this.filteredExperts.find(e => e.id === expertId);
        if (!expert) {
          return {
            doctorId: String(expertId),
            doctorName: `专家${expertId}`,
            avatar: '',
            hospitalArea: '北京人民医院',
            department: '消化内科',
            title: ''
          };
        }
        
        return {
          doctorId: String(expertId), // 确保doctorId是字符串类型
          doctorName: expert.name,
          avatar: expert.avatar || '', // 保存医生头像
          hospitalArea: expert.hospitalArea || '北京人民医院', // 保存医生所在医院
          department: expert.department || '消化内科', // 保存医生部门
          title: expert.title || '' // 保存医生职称
        };
      });
      
      console.log('已选择医生（包含完整信息）：', this.participatingDoctors);
      
      // 设置会诊时间
      const consultationTime = this.getFormattedConsultationTime();
      if (consultationTime.startTime) {
        // 如果有选择会诊时间，则设置到表单中
        this.formattedStartTime = consultationTime.startTime;
        this.formattedEndTime = consultationTime.endTime;
        console.log('设置会诊时间:', this.formattedStartTime, '至', this.formattedEndTime);
      } else {
        // 否则使用默认时间（当前时间后一小时）
        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 1);
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1);
        
        this.formattedStartTime = this.formatDateTime(startTime);
        this.formattedEndTime = this.formatDateTime(endTime);
        console.log('使用默认会诊时间:', this.formattedStartTime, '至', this.formattedEndTime);
      }
      
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
        avatar: 'https://placehold.co/40'
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
          avatar: 'https://placehold.co/40'
        }
      ];
      
      // 初始化参会人员列表
      this.participants = [
        { name: record.requestingDoctorName, avatar: 'https://placehold.co/40' }
      ];
      
      if (record.participatingDoctors && record.participatingDoctors.length > 0) {
        record.participatingDoctors.forEach(doctor => {
          this.participants.push({
            name: doctor.name,
            avatar: 'https://placehold.co/40'
          });
        });
      }
    },
    findConsultationByRecordId(recordId) {
      // 先尝试从本地缓存查找
      const localConsultation = this.mockData.find(item => item.recordId === recordId);
      
      if (localConsultation && localConsultation.consultationFormEntity) {
        // 如果本地找到且包含表单数据，直接返回
        console.log('从本地缓存找到完整会诊记录:', recordId);
        return localConsultation;
      }
      
      console.log('需要从API获取会诊记录:', recordId);
      
      // 返回一个基本对象，确保有recordId
      const basicConsultation = { recordId: recordId };
      
      // 异步获取完整数据
      this.fetchConsultationDetail(recordId).then(consultationData => {
        console.log('成功获取会诊记录:', recordId);
        
        // 查找本地是否已存在此会诊记录
        const existingIndex = this.mockData.findIndex(item => item.recordId === recordId);
        
        if (existingIndex >= 0) {
          // 如果已存在，更新它
          this.$set(this.mockData, existingIndex, consultationData);
        } else {
          // 如果不存在，添加到本地缓存
          this.mockData.push(consultationData);
        }
      }).catch(error => {
        console.error('获取会诊记录错误:', error);
      });
      
      return basicConsultation;
    },
    searchPatients() {
      this.showSearchResults = true;
      
      // 如果输入为空，不进行搜索
      if (!this.consultationForm.patientName || this.consultationForm.patientName.trim() === '') {
        this.filteredPatients = [];
        return;
      }
      
      // 使用实际API获取患者名称列表
      this.$request.get(`/admin/patient/nameList?name=${this.consultationForm.patientName}`).then(res => {
        if (res && Array.isArray(res)) {
          this.filteredPatients = res;
        } else {
          this.filteredPatients = [];
          console.warn('获取患者列表返回格式异常:', res);
        }
      }).catch(err => {
        console.error('获取患者列表失败:', err);
        this.filteredPatients = [];
        
        // 如果API调用失败，使用模拟数据作为备用
        this.searchPatientsFallback();
      });
    },
    
    selectPatient(patient) {
      // 获取患者详情
      this.$request.get(`/admin/patient/${patient.pk_id}`).then(res => {
        if (res) {
          // 存储完整的患者详情数据
          const patientDetail = res;
          
          // 更新表单信息
          this.consultationForm.patientName = patientDetail.name;
          this.consultationForm.age = patientDetail.age || '';
          this.consultationForm.gender = patientDetail.sex || '男';
      this.consultationForm.idType = '身份证';
          this.consultationForm.idNumber = patientDetail.ssn || '';
          this.consultationForm.height = patientDetail.height || '';
          this.consultationForm.weight = patientDetail.weight || '';
          this.consultationForm.hometown = patientDetail.address || '';
          this.consultationForm.occupation = patientDetail.occupation || '';
          this.consultationForm.maritalStatus = patientDetail.maritalStatus || '';
          this.consultationForm.birthDate = patientDetail.dob || '';
          this.consultationForm.phone = patientDetail.mobile || '';
          
          // 设置病历相关字段
          this.consultationForm.chiefComplaint = patientDetail.diagnosis ? 
            `患者${patientDetail.name}主因${patientDetail.diagnosis}入院治疗...` : 
            `患者${patientDetail.name}入院治疗...`;
      this.consultationForm.physicalSigns = "暂无详细体征记录";
          this.consultationForm.clinicalDiagnosis = patientDetail.diagnosis || '';
          this.consultationForm.consultationPurpose = patientDetail.diagnosis ? 
            `针对${patientDetail.diagnosis}进行专家会诊，制定最佳诊疗方案。` : 
            `进行专家会诊，制定最佳诊疗方案。`;
          
          // 清空已上传文件
      this.consultationForm.files = [];
          
          // 完全覆盖selectedPatient为新的患者对象
          this.selectedPatient = {
            pkId: patientDetail.pkId,
            name: patientDetail.name,
            gender: patientDetail.sex,
            age: patientDetail.age,
            birthDate: patientDetail.dob,
            idNumber: patientDetail.ssn,
            phone: patientDetail.mobile,
            height: patientDetail.height,
            weight: patientDetail.weight,
            hometown: patientDetail.address,
            occupation: patientDetail.occupation,
            maritalStatus: patientDetail.maritalStatus,
            ethnicity: '',
            hospitalName: patientDetail.hospitalName,
            dept: patientDetail.dept,
            disease: patientDetail.diagnosis
          };
        } else {
          this.$message.error('获取患者详情失败');
        }
      }).catch(err => {
        console.error('获取患者详情失败:', err);
        
        // 如果API调用失败，使用模拟数据备用
        if (patientSearchData && patientSearchData.patientList) {
          const backupPatient = patientSearchData.patientList.find(p => p.pkId === patient.pk_id || p.pkId === Number(patient.pk_id));
          if (backupPatient) {
            this.selectPatientFallback(backupPatient);
          } else {
            // 创建一个基础患者对象
            this.selectPatientFallback({
              pkId: patient.pk_id,
              name: patient.name,
              gender: '男',
              age: '',
              disease: ''
            });
          }
        } else {
          this.$message.error('无法获取患者详情，且模拟数据不可用');
        }
      });
      
      this.showSearchResults = false;
    },
    
    // API调用失败时的备用方法
    selectPatientFallback(patient) {
      this.consultationForm.patientName = patient.name;
      this.consultationForm.age = patient.age || '';
      this.consultationForm.gender = patient.gender || '男';
      this.consultationForm.idType = '身份证';
      this.consultationForm.idNumber = patient.idNumber || '';
      this.consultationForm.height = patient.height || '';
      this.consultationForm.weight = patient.weight || '';
      this.consultationForm.hometown = patient.hometown || '';
      this.consultationForm.occupation = patient.occupation || '';
      this.consultationForm.maritalStatus = patient.maritalStatus || '';
      this.consultationForm.ethnicity = patient.ethnicity || '';
      this.consultationForm.birthDate = patient.birthDate || '';
      this.consultationForm.phone = patient.phone || '';
      
      this.consultationForm.chiefComplaint = patient.disease ? 
        `患者${patient.name}主因${patient.disease}入院治疗...` : 
        `患者${patient.name}入院治疗...`;
      this.consultationForm.physicalSigns = "暂无详细体征记录";
      this.consultationForm.clinicalDiagnosis = patient.disease || '';
      this.consultationForm.consultationPurpose = patient.disease ? 
        `针对${patient.disease}进行专家会诊，制定最佳诊疗方案。` : 
        `进行专家会诊，制定最佳诊疗方案。`;
      
      this.consultationForm.files = [];
      
      // 完全覆盖selectedPatient为新的患者对象
      this.selectedPatient = {...patient};
      
      this.$message.warning('已使用本地数据，部分信息可能不完整');
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
      if (this.selectedPatient && this.selectedPatient.pkId) {
        // 如果已经有选中的患者，直接使用
        this.showPatientDetailPage();
      } else {
        // 尝试根据姓名获取患者列表
        this.$request.get(`/admin/patient/nameList?name=${this.consultationForm.patientName}`).then(res => {
          if (res && Array.isArray(res) && res.length > 0) {
            // 找到匹配的患者，获取详情
            const matchedPatient = res.find(p => p.name === this.consultationForm.patientName);
            
            if (matchedPatient) {
              // 获取患者详情
              this.$request.get(`/admin/patient/${matchedPatient.pk_id}`).then(patientDetail => {
                if (patientDetail) {
                  // 更新selectedPatient对象
                  this.selectedPatient = {
                    pkId: patientDetail.pkId,
                    name: patientDetail.name,
                    gender: patientDetail.sex,
                    age: patientDetail.age,
                    birthDate: patientDetail.dob,
                    idNumber: patientDetail.ssn,
                    phone: patientDetail.mobile,
                    height: patientDetail.height,
                    weight: patientDetail.weight,
                    hometown: patientDetail.address,
                    occupation: patientDetail.occupation,
                    maritalStatus: patientDetail.maritalStatus,
                    ethnicity: '',
                    hospitalName: patientDetail.hospitalName,
                    dept: patientDetail.dept,
                    disease: patientDetail.diagnosis
                  };
                  
                  this.showPatientDetailPage();
                } else {
                  this.$message.error('获取患者详情失败');
                }
              }).catch(err => {
                console.error('获取患者详情失败:', err);
                this.fallbackPatientDetail();
              });
            } else {
              this.fallbackPatientDetail();
            }
          } else {
            this.fallbackPatientDetail();
          }
        }).catch(err => {
          console.error('获取患者列表失败:', err);
          this.fallbackPatientDetail();
        });
      }
    },
    
    // 显示患者详情页面
    showPatientDetailPage() {
      if (!this.selectedPatient || !this.selectedPatient.name) {
        this.$message.warning('患者数据不完整，无法显示详情');
        return;
      }
      
      // 显示患者详情组件
      this.showPatientDetail = true;
      
      // 隐藏其他组件
      this.showMain = false;
      this.showDetail = false;
      this.showForm = false;
      this.showCreateConsultation = false;
      this.showMeetingChat = false;
      
      // 可以记录选择，以便返回时还原
      this.previousView = {
        showMain: this.showMain,
        showDetail: this.showDetail,
        showForm: this.showForm,
        showCreateConsultation: this.showCreateConsultation
      };
    },
    
    // 备用方法：当API调用失败时使用模拟数据
    fallbackPatientDetail() {
      // 如果API调用失败，尝试使用本地模拟数据
      if (patientSearchData && patientSearchData.patientDetails) {
        const backupPatient = patientSearchData.patientDetails.find(p => 
          p.name === this.consultationForm.patientName
        );
        
        if (backupPatient) {
          // 更新selectedPatient对象
          this.selectedPatient = {
            pkId: backupPatient.pkId,
            name: backupPatient.name,
            gender: backupPatient.sex,
            age: backupPatient.age,
            birthDate: backupPatient.dob,
            idNumber: backupPatient.ssn,
            phone: backupPatient.mobile,
            height: backupPatient.height,
            weight: backupPatient.weight,
            hometown: backupPatient.address,
            occupation: backupPatient.occupation,
            maritalStatus: backupPatient.maritalStatus,
            ethnicity: '',
            hospitalName: backupPatient.hospitalName,
            dept: backupPatient.dept,
            disease: backupPatient.diagnosis
          };
          
          this.showPatientDetailPage();
          this.$message.warning('使用本地数据显示患者详情，部分信息可能不完整');
        } else {
          this.$message.error('未找到匹配的患者记录');
        }
      } else {
        this.$message.error('无法获取患者详情');
      }
    },
    // 查看详情页面中获取会诊表单详情
    getConsultationFormDetails(recordId) {
      // 使用API获取会诊单详情
      getFormByFormId(recordId).then(res => {
        if (res.code === 200 && res.data) {
          this.consultationFormDetails = res.data;
          // 如果有会诊意见，加载到consultationOpinion中
          if (res.data.consultationOpinion) {
            this.consultationOpinion = res.data.consultationOpinion;
          } else {
            // 重置会诊意见
            this.consultationOpinion = '';
          }
        } else {
          this.$message.error('获取会诊详情失败');
        }
      }).catch(err => {
        console.error('获取会诊详情错误:', err);
        this.$message.error('获取会诊详情失败');
      });
    },

    // 在查看会诊报告时使用
    // getConsultationReport(recordId) {
    //   // // 使用API获取会诊报告
    //   // getReportByFormId(recordId).then(res => {
    //   //   if (res.code === 200 && res.data) {
    //   //     this.consultationReport = res.data;
    //   //     // 处理获取到的数据...
    //   //   } else {
    //   //     this.$message.error('获取会诊报告失败');
    //   //   }
    //   // }).catch(err => {
    //   //   console.error('获取会诊报告错误:', err);
    //   //   this.$message.error('获取会诊报告失败');
    //   // });
    // },

    // 医生接受或拒绝会诊的方法
    handleDoctorDecision(decision, recordId, reason = '') {
      const data = {
        recordId,
        decision, // true为接受，false为拒绝
        reason: reason || '' // 拒绝原因，接受时可为空
      };
      
      doctorDecision(data).then(res => {
        if (res.code === 200) {
          this.$message.success(decision ? '已接受会诊' : '已拒绝会诊');
          // 刷新数据
          this.handleQuery();
        } else {
          this.$message.error(res.msg || '操作失败');
        }
      }).catch(err => {
        console.error('医生决策错误:', err);
        this.$message.error('操作失败');
      });
    },

    // 显示医生拒绝原因
    handleShowRejection(item) {
      // 获取拒绝原因
      queryDoctorRefuseReasons(item.recordId).then(res => {
        if (res.code === 200 && res.data) {
          // 显示拒绝医生和原因
          const rejectList = res.data;
          let message = '拒绝医生列表:\n';
          
          rejectList.forEach(reject => {
            message += `${reject.doctorName}: ${reject.reason || '未提供原因'}\n`;
          });
          
          this.$alert(message, '拒绝原因', {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定'
          });
        } else {
          this.$message.error('获取拒绝原因失败');
        }
      }).catch(err => {
        console.error('获取拒绝原因错误:', err);
        this.$message.error('获取拒绝原因失败');
      });
    },

    // 患者接受或拒绝会诊的方法
    handlePatientDecision(decision, recordId, reason = '') {
      const data = {
        recordId,
        decision, // true为接受，false为拒绝
        reason: reason || '' // 拒绝原因，接受时可为空
      };
      
      patientDecision(data).then(res => {
        if (res.code === 200) {
          this.$message.success(decision ? '患者已接受会诊' : '患者已拒绝会诊');
          // 刷新数据
          this.handleQuery();
        } else {
          this.$message.error(res.msg || '操作失败');
        }
      }).catch(err => {
        console.error('患者决策错误:', err);
        this.$message.error('操作失败');
      });
    },

    // 提交新建会诊表单
    submitConsultationForm() {
      // 验证表单...
      
      // 构建提交数据
      const formData = {
        patientName: this.consultationForm.patientName,
        gender: this.consultationForm.gender,
        age: this.consultationForm.age,
        phone: this.consultationForm.phone,
        birthDate: this.consultationForm.birthDate,
        height: this.consultationForm.height,
        weight: this.consultationForm.weight,
        maritalStatus: this.consultationForm.maritalStatus,
        ethnicity: this.consultationForm.ethnicity,
        nativePlace: this.consultationForm.hometown,
        occupation: this.consultationForm.occupation,
        chiefComplaint: this.consultationForm.chiefComplaint,
        clinicalDiagnosis: this.consultationForm.clinicalDiagnosis,
        symptoms: this.consultationForm.physicalSigns,
        diagnosisPurpose: this.consultationForm.consultationPurpose,
        imageUrls: this.consultationForm.files.map(file => file.url),
        // 其他必要信息...
        participatingDoctors: this.selectedExperts.map(id => ({
          doctorId: id
        }))
      };
      
      // 提交表单
      createConsultation(formData).then(res => {
        if (res.code === 200) {
          this.$message.success('会诊创建成功');
          this.showCreateConsultation = false;
          // 刷新列表
          this.handleQuery();
        } else {
          this.$message.error(res.msg || '创建会诊失败');
        }
      }).catch(err => {
        console.error('创建会诊错误:', err);
        this.$message.error('创建会诊失败');
      });
    },
    // 医生接受会诊
    handleAccept(item) {
      // 显示确认会诊弹窗
      this.$confirm(
        '<div style="text-align: center;">' +
          '<p>您将确认此次会诊？</p>' +
          '<p style="color: #ff9800;">会诊时间为: ' + this.formatConsultationTime(item.startTime, item.endTime) + '</p>' +
        '</div>',
        '会诊同意',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确认',
          showCancelButton: false,
          center: true,
          customClass: 'consultation-confirm-dialog'
        }
      ).then(() => {
        // 调用医生决策API，接受会诊
        this.handleDoctorDecision(true, item.recordId);
      }).catch(() => {
        // 用户关闭弹窗
        this.$message({
          type: 'info',
          message: '已取消操作'
        });
      });
    },
    
    // 医生拒绝会诊
    handleReject(item) {
      // 显示拒绝原因输入对话框
      this.$prompt('请输入拒绝原因', '拒绝会诊', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputValidator: (value) => {
          return value.length > 0 ? true : '请输入拒绝原因';
        }
      }).then(({ value }) => {
        // 调用医生决策API，拒绝会诊
        this.handleDoctorDecision(false, item.recordId, value);
      }).catch(() => {
        // 用户取消操作
        this.$message({
          type: 'info',
          message: '取消拒绝操作'
        });
      });
    },
    
    // 患者接受会诊
    handlePatientAccept(item) {
      // 调用患者决策API，接受会诊
      this.handlePatientDecision(true, item.recordId);
    },
    
    // 患者拒绝会诊
    handlePatientReject(item) {
      // 显示拒绝原因输入对话框
      this.$prompt('请输入拒绝原因', '患者拒绝会诊', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputValidator: (value) => {
          return value.length > 0 ? true : '请输入拒绝原因';
        }
      }).then(({ value }) => {
        // 调用患者决策API，拒绝会诊
        this.handlePatientDecision(false, item.recordId, value);
      }).catch(() => {
        // 用户取消操作
        this.$message({
          type: 'info',
          message: '取消拒绝操作'
        });
      });
    },
    // 取消会诊
    handleCancel(item) {
      this.$confirm('确定取消这个会诊吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 获取当前会诊记录
        getConsultationById(item.recordId).then(res => {
          if (res.code === 200 && res.data) {
            const consultationData = res.data;
            // 修改会诊状态为已取消(3)
            consultationData.consultationStatus = 3;
            
            // 更新会诊记录
            updateConsultation(item.recordId, consultationData).then(updateRes => {
              if (updateRes.code === 200) {
                this.$message.success('会诊已取消');
                // 刷新列表
                this.handleQuery();
              } else {
                this.$message.error(updateRes.msg || '取消会诊失败');
              }
            }).catch(error => {
              console.error('取消会诊错误:', error);
              this.$message.error('取消会诊失败: ' + (error.message || '未知错误'));
            });
          } else {
            this.$message.error(res.msg || '获取会诊记录失败');
          }
        }).catch(error => {
          console.error('获取会诊记录错误:', error);
          this.$message.error('获取会诊记录失败: ' + (error.message || '未知错误'));
        });
      }).catch(() => {
        // 用户取消操作
        this.$message({
          type: 'info',
          message: '已取消操作'
        });
      });
    },

    // 删除会诊记录
    handleDelete(item) {
      this.$confirm('确定删除这个会诊记录吗? 此操作不可恢复!', '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        // 调用删除API
        deleteConsultation(item.recordId).then(res => {
          if (res.code === 200) {
            this.$message.success('会诊记录已删除');
            // 刷新列表
            this.handleQuery();
          } else {
            this.$message.error(res.msg || '删除会诊记录失败');
          }
        }).catch(error => {
          console.error('删除会诊记录错误:', error);
          this.$message.error('删除会诊记录失败: ' + (error.message || '未知错误'));
        });
      }).catch(() => {
        // 用户取消操作
        this.$message({
          type: 'info',
          message: '已取消删除操作'
        });
      });
    },
    handleSubmitPreview() {
      if (!this.consultationOpinion.trim()) {
        this.$message.warning('请先填写会诊意见');
        return;
      }
      
      // 显示预览确认框
      this.$confirm(`您确定要提交以下会诊意见吗？<br/><br/>${this.consultationOpinion.replace(/\n/g, '<br/>')}`, '提交会诊意见', {
          dangerouslyUseHTMLString: true,
        confirmButtonText: '确认提交',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
              this.saveConsultationOpinion();
      }).catch(() => {
        // 用户取消提交
      });
    },
    
    handleGenerateReport() {
      if (!this.consultationOpinion.trim()) {
        this.$message.warning('请先填写会诊意见');
        return;
      }
      
      // 先保存会诊意见，然后生成报告
      this.saveConsultationOpinion().then(() => {
        this.$message.success('会诊报告已生成，请在会诊记录中查看');
      }).catch(() => {
        this.$message.error('生成会诊报告失败');
      });
    },
    
    saveConsultationOpinion() {
      return new Promise((resolve, reject) => {
        if (!this.currentRow || !this.currentRow.recordId) {
          this.$message.error('无法保存会诊意见：无效的会诊记录');
          reject(new Error('无效的会诊记录'));
          return;
        }
        
        // 显示加载中提示
        const loading = this.$loading({
          lock: true,
          text: '正在提交会诊意见...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
      
        // 构建提交参数
        const params = {
          recordId: this.currentRow.recordId,
          consultationOpinion: this.consultationOpinion
        };
        
        console.log('提交会诊意见参数:', params);
        console.log('会诊意见通过请求头传递');
      
        // 调用API提交会诊意见
        submitConsultationOpinion(params).then(res => {
          // 关闭加载提示
          loading.close();
          
          if (res.code === 200) {
            this.$message.success('会诊意见提交成功');
            resolve(res.data);
          } else {
            this.$message.error(res.msg || '提交会诊意见失败');
            reject(new Error(res.msg || '提交会诊意见失败'));
          }
        }).catch(error => {
          // 关闭加载提示
          loading.close();
          
          console.error('提交会诊意见错误:', error);
          this.$message.error('提交会诊意见失败: ' + (error.message || '未知错误'));
          reject(error);
        });
      });
    },
    
    // 备用方法：使用本地模式保存会诊意见
    saveConsultationOpinionFallback() {
      // 此方法已不再需要，移除实现
      return Promise.reject(new Error('不支持本地保存'));
    },
    
    hasSubmittedOpinion(consultation) {
      if (!consultation) return false;
      
      // 检查consultationForm是否存在且有consultationOpinion
      if (consultation.consultationForm && consultation.consultationForm.consultationOpinion) {
        return !!consultation.consultationForm.consultationOpinion.trim();
      }
      
      // 如果没有consultationForm或consultationOpinion，则认为未提交
      return false;
    },
    
    scrollToOpinionSection() {
      this.$nextTick(() => {
        const opinionElement = document.querySelector('.consultation-result');
        if (opinionElement) {
          opinionElement.scrollIntoView({ behavior: 'smooth' });
        }
      });
    },
    // 报告页脚
    buildReportFooter(container) {
      const footer = document.createElement('div');
      footer.className = 'report-footer';
      footer.style.display = 'flex';
      footer.style.justifyContent = 'space-between';
      footer.style.marginTop = '50px';
      
      const doctorSection = document.createElement('div');
      doctorSection.style.flex = '1';
      
      const doctorText = document.createElement('p');
      doctorText.style.margin = '0';
      doctorText.textContent = '会诊医生：' + (this.currentRow && this.currentRow.requestingDoctorName ? this.currentRow.requestingDoctorName : '未知');
      
      doctorSection.appendChild(doctorText);
      
      const dateSection = document.createElement('div');
      dateSection.style.flex = '1';
      dateSection.style.textAlign = 'right';
      
      const dateText = document.createElement('p');
      dateText.style.margin = '0';
      dateText.textContent = '会诊日期：' + new Date().toLocaleDateString();
      
      dateSection.appendChild(dateText);
      
      footer.appendChild(doctorSection);
      footer.appendChild(dateSection);
      container.appendChild(footer);
    },
    
    // 添加信息字段
    addInfoField(container, label, value) {
      const field = document.createElement('div');
      field.style.width = '50%';
      field.style.marginBottom = '10px';
      field.textContent = label + '：' + value;
      container.appendChild(field);
    },
    
    // 添加临床信息项
    addClinicalItem(container, title, content) {
      const item = document.createElement('div');
      item.style.marginBottom = '15px';
      
      const heading = document.createElement('h3');
      heading.style.fontSize = '16px';
      heading.style.margin = '0 0 10px 0';
      heading.style.color = '#333';
      heading.textContent = title;
      
      const text = document.createElement('p');
      text.style.margin = '0';
      text.style.color = '#666';
      text.textContent = content;
      
      item.appendChild(heading);
      item.appendChild(text);
      container.appendChild(item);
    },
    // 报告头部
    buildReportHeader(container) {
      const header = document.createElement('div');
      header.className = 'report-header';
      header.style.textAlign = 'center';
      header.style.marginBottom = '30px';
      
      const title = document.createElement('h1');
      title.style.color = '#333';
      title.style.fontSize = '24px';
      title.style.margin = '0';
      title.textContent = '会诊报告';
      
      // 添加报告生成日期
      const dateDiv = document.createElement('div');
      dateDiv.style.color = '#666';
      dateDiv.style.fontSize = '14px';
      dateDiv.style.marginTop = '10px';
      dateDiv.style.textAlign = 'right';
      
      // 获取当前日期并格式化
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      dateDiv.textContent = '报告生成日期：' + year + '年' + month + '月' + day + '日';
      
      header.appendChild(title);
      header.appendChild(dateDiv);
      container.appendChild(header);
    },
    
    // 患者基本信息
    buildPatientInfo(container) {
      const section = document.createElement('div');
      section.className = 'report-patient-info';
      section.style.marginBottom = '30px';
      section.style.border = '1px solid #e8e8e8';
      section.style.padding = '15px';
      section.style.borderRadius = '4px';
      
      const heading = document.createElement('h2');
      heading.style.color = '#4cae4f';
      heading.style.fontSize = '18px';
      heading.style.margin = '0 0 15px 0';
      heading.style.paddingBottom = '10px';
      heading.style.borderBottom = '1px solid #e8e8e8';
      heading.textContent = '患者基本信息';
      
      const infoContainer = document.createElement('div');
      infoContainer.style.display = 'flex';
      infoContainer.style.flexWrap = 'wrap';
      
      // 添加患者信息字段
      this.addInfoField(infoContainer, '姓名', this.patientInfo.name || '未知');
      this.addInfoField(infoContainer, '性别', this.patientInfo.gender || '未知');
      this.addInfoField(infoContainer, '年龄', this.patientInfo.age || '未知');
      this.addInfoField(infoContainer, '联系电话', this.patientInfo.phone || '未知');
      
      section.appendChild(heading);
      section.appendChild(infoContainer);
      container.appendChild(section);
    },
    
    // 临床信息
    buildClinicalInfo(container) {
      const section = document.createElement('div');
      section.className = 'report-clinical-info';
      section.style.marginBottom = '30px';
      section.style.border = '1px solid #e8e8e8';
      section.style.padding = '15px';
      section.style.borderRadius = '4px';
      
      const heading = document.createElement('h2');
      heading.style.color = '#4cae4f';
      heading.style.fontSize = '18px';
      heading.style.margin = '0 0 15px 0';
      heading.style.paddingBottom = '10px';
      heading.style.borderBottom = '1px solid #e8e8e8';
      heading.textContent = '临床信息';
      
      section.appendChild(heading);
      
      // 添加临床信息项
      this.addClinicalItem(section, '患者主诉', this.patientInfo.chiefComplaint || '无');
      this.addClinicalItem(section, '临床诊断', this.patientInfo.clinicalDiagnosis || '无');
      this.addClinicalItem(section, '体征', this.patientInfo.physicalSigns || '无');
      
      container.appendChild(section);
    },
    
    // 会诊意见
    buildConsultationOpinion(container) {
      const section = document.createElement('div');
      section.className = 'report-consultation-opinion';
      section.style.marginBottom = '30px';
      section.style.border = '1px solid #e8e8e8';
      section.style.padding = '15px';
      section.style.borderRadius = '4px';
      
      const heading = document.createElement('h2');
      heading.style.color = '#4cae4f';
      heading.style.fontSize = '18px';
      heading.style.margin = '0 0 15px 0';
      heading.style.paddingBottom = '10px';
      heading.style.borderBottom = '1px solid #e8e8e8';
      heading.textContent = '会诊意见';
      
      const opinionText = document.createElement('p');
      opinionText.style.margin = '0';
      opinionText.style.color = '#333';
      opinionText.style.whiteSpace = 'pre-wrap';
      opinionText.style.lineHeight = '1.6';
      opinionText.textContent = this.consultationOpinion;
      
      section.appendChild(heading);
      section.appendChild(opinionText);
      container.appendChild(section);
    },
    handleViewMore() {
      // 使用当前激活的状态标签页
      // 重置页码
      this.currentPage = 1;
      // 重新加载当前用户的会诊记录
      this.loadUserConsultations();
    },
    goToPatientDetailFromTab() {
      // 区分是否在创建新会诊
      const isCreatingNewConsultation = this.showCreateConsultation;

      // 如果是在创建新会诊，使用填写表单中的患者信息
      if (isCreatingNewConsultation && this.consultationForm) {
        // 确保表单中有基本的患者信息
        if (!this.consultationForm.patientName) {
          this.$message.warning('请先填写患者姓名等基本信息');
          return;
        }
        
        // 构建PatientDetail组件需要的格式，从consultationForm中获取信息
        this.selectedPatient = {
          pkId: this.$storage.getItem('patientId') || 0,
          name: this.consultationForm.patientName,
          sex: this.consultationForm.gender === '男' ? 1 : 2,
          age: this.consultationForm.age,
          mobile: this.consultationForm.phone,
          dob: this.consultationForm.birthDate,
          ssn: this.consultationForm.idNumber,
          dept: '',
          hospitalName: '',
          // 添加其他可能有用的信息
          maritalStatus: this.consultationForm.maritalStatus,
          height: this.consultationForm.height,
          weight: this.consultationForm.weight,
          ethnicity: this.consultationForm.ethnicity,
          hometown: this.consultationForm.hometown,
          occupation: this.consultationForm.occupation,
          chiefComplaint: this.consultationForm.chiefComplaint,
          clinicalDiagnosis: this.consultationForm.clinicalDiagnosis,
          physicalSigns: this.consultationForm.physicalSigns
        };
        
        // 显示患者详情组件
        this.showPatientDetailXQ = true;
        return;
      }
      
      // 否则使用当前正在查看的患者信息（原有逻辑）
      if (!this.patientInfo || !this.patientInfo.name) {
        this.$message.warning('无法获取患者信息');
        return;
      }
      
      // 构建PatientDetail组件需要的格式
        this.selectedPatient = {
        pkId: (this.currentRow && this.currentRow.patientId) ? this.currentRow.patientId : 0,
        name: this.patientInfo.name,
        sex: this.patientInfo.gender === '男' ? 1 : 2,
        age: this.patientInfo.age,
        mobile: this.patientInfo.phone,
        dob: this.patientInfo.birthDate,
        ssn: this.patientInfo.idNumber,
        dept: this.patientInfo.dept,
        hospitalName: this.patientInfo.hospital
      };
      
      // 显示患者详情组件
        this.showPatientDetailXQ = true;
    },
    closePatientDetailXQ() {
      this.showPatientDetailXQ = false;
    },
    // API调用失败时使用本地模拟数据
    searchPatientsFallback() {
      // 使用模拟数据作为备用
      if (patientSearchData && patientSearchData.nameListData) {
        this.filteredPatients = patientSearchData.nameListData.filter(patient => 
          patient.name.includes(this.consultationForm.patientName)
        );
      } else {
        console.error('模拟数据不可用');
        this.filteredPatients = [];
      }
    },
    
    getPatientDetailFromMock(patientId) {
      if (patientSearchData && patientSearchData.patientDetails) {
        // 使用新格式模拟数据
        return patientSearchData.patientDetails.find(p => p.pkId === patientId);
      } else if (patientSearchData && patientSearchData.patientList) {
        // 使用旧格式模拟数据
        const patient = patientSearchData.patientList.find(p => p.pkId === patientId);
        if (patient) {
          // 转换为新API格式
          return {
            pkId: patient.pkId,
            name: patient.name,
            sex: patient.gender,
            ssn: patient.idNumber,
            mobile: patient.phone,
            dob: patient.birthDate,
            age: patient.age,
            address: patient.hometown,
            maritalStatus: patient.maritalStatus,
            hospitalName: patient.hospitalName,
            diagnosis: patient.disease
          };
        }
      }
      return null;
    },
    // 加载当前用户的会诊记录
    loadUserConsultations() {
      // 获取当前登录的用户名
      const currentUser = this.$storage.getItem('loginName') || '张医生';
      
      // 根据当前选中的标签确定要查询的状态
      let consultationStatus;
      let approved;
      
      switch (this.activeStatus) {
        case 'special': // 待确认
          consultationStatus = 0;
          approved = false;
          break;
        case 'consultation': // 待会诊
          consultationStatus = 1; // 状态为0且approved为true，或状态为1
          approved = true; // 对状态0使用approved=true筛选
          break;
        case 'inProgress': // 正在会诊
          consultationStatus = 4;
          break;
        case 'completed': // 已会诊
          consultationStatus = 2;
          break;
        case 'cancelled': // 已取消
          consultationStatus = 3;
          break;
        default:
          consultationStatus = 1; // 默认显示待会诊
          break;
      }
      
      // 构建查询参数
      const queryParams = {
        consultationStatus: consultationStatus,
        pageNum: this.currentPage,
        pageSize: this.pageSize,
      };
      
      // 对于待确认状态，添加approved参数
      if (this.activeStatus === 'special' || this.activeStatus === 'consultation') {
        queryParams.approved = approved;
      }
      
      // 如果有搜索条件，添加搜索参数
      if (this.searchQuery) {
        queryParams.searchQuery = this.searchQuery;
      }
      
      // 如果有日期范围，添加日期参数
      if (this.startDate && this.endDate) {
        queryParams.startDate = this.startDate;
        queryParams.endDate = this.endDate;
      }
      
      // 移除undefined的参数
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });
      
      // 显示加载中提示
      const loading = this.$loading({
        lock: true,
        text: '加载数据中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      
      // 调用分页查询API
      queryConsultationPage(queryParams).then(res => {
        // 关闭加载提示
        loading.close();
        
        if (res.code === 200 && res.data) {
          // 更新表格数据
          this.tableData = res.data.records || [];
          // 更新分页信息
          this.total = res.data.total || 0;
          this.currentPage = res.data.current || 1;
          this.pageSize = res.data.size || 12;
        } else {
          this.$message.error(res.msg || '查询会诊记录失败');
          // 使用本地数据作为备用
          this.loadLocalConsultations();
        }
      }).catch(error => {
        // 关闭加载提示
        loading.close();
        
        
        console.error('查询会诊记录错误:', error);
        this.$message.error('查询会诊记录失败: ' + (error.message || '未知错误'));
        
        // 使用模拟数据作为备用
        this.loadLocalConsultations();
      });
    },
    
    // 当API调用失败时使用本地模拟数据
    loadLocalConsultations() {
      console.log('使用本地模拟数据作为备用');
      
      // 获取当前登录的用户名
      const currentUser = this.$storage.getItem('loginName') || '张医生';
      console.log('当前用户:', currentUser);
      
      // 先筛选出当前用户作为发起人的会诊记录
      const userConsultations = this.mockData.filter(item => 
        item.requestingDoctorName === currentUser
      );
      
      // 根据状态进一步筛选
      const filteredData = this.getFilteredDataByStatus(this.activeStatus);
      
      // 确保筛选后的数据都是当前用户的会诊记录
      const finalFilteredData = filteredData.filter(item => 
        item.requestingDoctorName === currentUser
      );
      
      // 更新分页后的数据
      this.updatePaginatedData(finalFilteredData);
    },
    
    // 按状态筛选用户的会诊记录
    filterUserConsultations(consultations) {
      // 根据activeStatus进一步筛选
      switch (this.activeStatus) {
        case 'special': // 待确认
          return consultations.filter(item => item.consultationStatus === 0 && item.approved === false);
        case 'consultation': // 待会诊（不包括会诊中）
          return consultations.filter(item => 
            (item.consultationStatus === 0 && item.approved === true) || 
            item.consultationStatus === 1
          );
        case 'inProgress': // 正在会诊
          return consultations.filter(item => item.consultationStatus === 4);
        case 'completed': // 已会诊
          return consultations.filter(item => item.consultationStatus === 2);
        case 'cancelled': // 已取消
          return consultations.filter(item => item.consultationStatus === 3);
        default:
          return consultations;
      }
    },
    // 获取图片URL
    getImageUrl(path) {
      if (!path) return '';
      // 如果路径已经包含完整的URL，直接返回
      if (path.startsWith('http')) return path;
      // 如果路径已经包含/api/file/Image/userAvatar/，直接返回
      if (path.includes('/api/file/Image/userAvatar/')) return this.define.comUrl + path;
      // 否则拼接完整路径
      return this.define.comUrl + '/api/file/Image/userAvatar/' + path;
    },
    // 从表单数据更新患者信息
    updatePatientInfoFromForm(formData) {
      if (!formData) return;
      
      // 补充患者信息
      if (formData.patientName) this.patientInfo.name = formData.patientName;
      if (formData.gender) this.patientInfo.gender = formData.gender;
      if (formData.age) this.patientInfo.age = formData.age;
      if (formData.phone) this.patientInfo.phone = formData.phone;
      if (formData.chiefComplaint) this.patientInfo.chiefComplaint = formData.chiefComplaint;
      if (formData.clinicalDiagnosis) this.patientInfo.clinicalDiagnosis = formData.clinicalDiagnosis;
      if (formData.physicalSigns) this.patientInfo.physicalSigns = formData.physicalSigns;
      if (formData.consultationPurpose) this.patientInfo.consultationPurpose = formData.consultationPurpose;
    },
    
    // 根据会诊单ID获取完整的会诊详情
    fetchConsultationDetail(recordId) {
      if (!recordId) {
        this.$message.error('缺少会诊单ID，无法获取详情');
        return Promise.reject('缺少会诊单ID');
      }
      
      // 显示加载中提示
      const loading = this.$loading({
        lock: true,
        text: '加载会诊详情...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      
      // 首先获取会诊记录详情
      return getConsultationById(recordId).then(consultationRes => {
        console.log('会诊记录原始数据:', JSON.stringify(consultationRes, null, 2));
        
        if (consultationRes.code === 200 && consultationRes.data) {
          const consultationData = consultationRes.data;
          
          // 检查consultationFormEntity是否为null
          if (!consultationData.consultationFormEntity) {
            // 如果为null，需要额外获取表单详情
            return getFormByFormId(recordId).then(formRes => {
              console.log('表单详情原始数据:', JSON.stringify(formRes, null, 2));
              
              if (formRes.code === 200 && formRes.data) {
                // 将表单详情放入consultationFormEntity
                consultationData.consultationFormEntity = formRes.data;
                // 不再添加formDetails字段
              }
              
              // 处理获取到的数据
              this.processConsultationData(consultationData);
              loading.close();
              return consultationData;
            }).catch(error => {
              console.error('获取表单详情错误:', error);
              // 即使获取表单失败，也返回基本的会诊记录
              this.processConsultationData(consultationData);
              loading.close();
              return consultationData;
            });
          } else {
            // 如果consultationFormEntity不为null，直接使用
            console.log('会诊记录中已包含表单数据:', JSON.stringify(consultationData.consultationFormEntity, null, 2));
            // 不再添加formDetails字段
            
            // 处理获取到的数据
            this.processConsultationData(consultationData);
            loading.close();
            return consultationData;
          }
        } else {
          // 如果获取会诊记录失败
          loading.close();
          this.$message.error(consultationRes.msg || '获取会诊记录失败');
          return Promise.reject(consultationRes.msg || '获取会诊记录失败');
        }
      }).catch(error => {
        // 关闭加载提示
        loading.close();
        
        console.error('获取会诊详情错误:', error);
        this.$message.error('获取会诊详情失败: ' + (error.message || '未知错误'));
        return Promise.reject(error);
      });
    },
    
    // 处理会诊数据的方法，提取为单独函数方便维护
    processConsultationData(consultationData) {
      if (!consultationData) {
        console.error('会诊数据为空');
        return;
      }
      
      // 立即设置显示患者详情，确保界面立即响应
      this.showPatientDetail = true;
      // 确保其他显示标志为false
      this.showPatientDetailXQ = false;
      this.showMeetingChat = false;
      this.showCreateConsultation = false;
      console.log('处理会诊数据，设置showPatientDetail=true，其他显示标志=false');
      
      console.log('合并后的会诊详情:', JSON.stringify(consultationData, null, 2));
      this.currentRow = consultationData;
      
      // 从会诊记录中提取患者基本信息
      this.patientInfo = {
        name: consultationData.patientName || '',
        gender: consultationData.patientGender || '',
        age: consultationData.patientAge || '',
        phone: consultationData.patientPhone || '',
        chiefComplaint: '',
        clinicalDiagnosis: consultationData.disease || '',
        physicalSigns: '',
        consultationPurpose: '',
        height: '',
        weight: '',
        idNumber: '',
        birthDate: '',
        occupation: '',
        maritalStatus: '',
        ethnicity: '',
        hometown: '',
        hospital: consultationData.hospital || '',
        dept: consultationData.requestingDeptName || ''
      };
      
      // 如果有表单数据，更新患者信息
      if (consultationData.consultationFormEntity) {
        try {
          const formData = consultationData.consultationFormEntity;
          this.patientInfo = {
            ...this.patientInfo,
            gender: formData.gender || this.patientInfo.gender,
            chiefComplaint: formData.chiefComplaint || '',
            clinicalDiagnosis: formData.clinicalDiagnosis || this.patientInfo.clinicalDiagnosis,
            physicalSigns: formData.symptoms || '',
            consultationPurpose: formData.diagnosisPurpose || '',
            height: formData.height || '',
            weight: formData.weight || '',
            idNumber: formData.documentNumber || '',
            birthDate: formData.birthDate || '',
            occupation: formData.occupation || '',
            maritalStatus: formData.maritalStatus || '',
            ethnicity: formData.ethnicity || '',
            hometown: formData.nativePlace || ''
          };
          
          // 如果有会诊意见，显示在表单中
          this.consultationOpinion = formData.consultationOpinion || '';
        } catch (error) {
          console.error('处理表单数据时出错:', error);
        }
      }
      
      // // 如果是已完成的会诊，获取会诊报告
      // if (consultationData.consultationStatus === 2) {
      //   this.getConsultationReport(consultationData.recordId);
      // }
      
      // // 如果有患者ID，尝试获取更多患者信息
      // if (consultationData.patientId) {
      //   this.fetchPatientInfo(consultationData.patientId);
      // }
      
      // 再次确认患者详情已设置为显示
      this.$nextTick(() => {
        if (!this.showPatientDetail) {
          console.warn('showPatientDetail在nextTick中仍然是false，强制设置为true');
          this.showPatientDetail = true;
        }
      });
    },
    // 使用本地数据的备用查看详情方法
    handleDetailFallback(row) {
      console.log('使用本地数据查看详情');
      this.currentRow = { ...row };
      
      // 获取患者详情
      if (row.patientId) {
        this.fetchPatientInfo(row.patientId);
      }
      
      // 确保设置showPatientDetail为true
      this.showPatientDetail = true;
    },
    // 预览图片
    previewImage(url) {
      if (!url) return;
      
      // 创建图片预览div
      const previewDiv = document.createElement('div');
      previewDiv.style.position = 'fixed';
      previewDiv.style.top = '0';
      previewDiv.style.left = '0';
      previewDiv.style.width = '100%';
      previewDiv.style.height = '100%';
      previewDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      previewDiv.style.zIndex = '9999';
      previewDiv.style.display = 'flex';
      previewDiv.style.justifyContent = 'center';
      previewDiv.style.alignItems = 'center';
      previewDiv.style.cursor = 'pointer';
      
      // 创建图片元素
      const img = document.createElement('img');
      img.src = url;
      img.style.maxWidth = '90%';
      img.style.maxHeight = '90%';
      img.style.objectFit = 'contain';
      
      // 点击关闭预览
      previewDiv.onclick = function() {
        document.body.removeChild(previewDiv);
      };
      
      // 将元素添加到body
      previewDiv.appendChild(img);
      document.body.appendChild(previewDiv);
    },
    // 处理直接提供的会诊详情数据
    handleDirectConsultationData(consultationData) {
      if (!consultationData) {
        this.$message.error('会诊详情数据为空');
        return;
      }
      
      try {
        // 保存当前数据
        this.currentRow = consultationData;
        
        // 处理会诊数据
        this.processConsultationData(consultationData);
        
        // 确保显示患者详情界面
        this.showPatientDetail = true;
        this.showPatientDetailXQ = false;
        this.showMeetingChat = false;
        this.showCreateConsultation = false;
        
        this.$message.success('已加载会诊详情');
      } catch (error) {
        console.error('处理会诊详情数据出错:', error);
        this.$message.error('处理会诊详情数据出错: ' + error.message);
      }
    },
    // 获取当前登录用户信息
    getUserInfo() {
      try {
        // 尝试从localStorage中获取userInfo
        const userInfoStr = this.$storage.getItem('userInfo');
        if (userInfoStr) {
          const userInfoData = JSON.parse(userInfoStr);
          if (userInfoData) {
            this.userInfo = {
              ...this.userInfo,
              ...userInfoData
            };
            console.log('获取到用户信息:', this.userInfo);
          }
        } else {
          console.log('未找到用户信息，使用默认值');
        }
      } catch (error) {
        console.error('获取用户信息出错:', error);
      }
    },
    // 处理会诊时间
    getFormattedConsultationTime() {
      if (!this.consultationDate) {
        return { startTime: '', endTime: '' };
      }
      
      const date = this.consultationDate;
      const startTime = this.consultationStartTime || '09:00';
      const endTime = this.consultationEndTime || '10:00';
      
      console.log('格式化会诊时间:', date, startTime, endTime);
      
      return {
        startTime: `${date} ${startTime}:00`,
        endTime: `${date} ${endTime}:00`
      };
    },
    // 格式化日期时间为 yyyy-MM-dd HH:mm:ss
    formatDateTime(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:00`;
    },
    // 预览图片
    previewUploadedImage(url) {
      if (!url) return;
      
      // 使用Element UI的图片预览组件
      this.$alert('<div style="text-align: center;"><img src="' + url + '" style="max-width: 100%; max-height: 500px;"></div>', '图片预览', {
        dangerouslyUseHTMLString: true,
        showConfirmButton: false,
        callback: () => {}
      });
    },
  }
}
</script>

<style lang="scss" scoped>
.please-container {
  width: 100%;
  height: 100%;
  display: flex;
  
  .right-sidebar {
    width: 220px;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    
    .current-consultation {
      background-color: #4cae4f;
      padding: 0;
      margin-bottom: 10px;
      border-radius: 5px; 
      overflow: hidden;
      // box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      border: 3px solid #4cae4f;
      
      .current-header {
        background-color: #4cae4f;
        color: white;
        padding: 15px;
        text-align: center;
        font-weight: bold;
        font-size: 16px;
      }
      
      .current-patient {
        padding: 20px;
        background-color:rgba(221, 238, 229, 0.964);
        color: #333;
        
        .patient-name {
          font-size: 26px;
          font-weight: bold;
          margin-bottom: 12px;
          color: #333;
        }
        
        .patient-info, .patient-time {
          font-size: 14px;
          color: #666;
          margin-bottom: 6px;
        }
        
        .patient-link {
          font-size: 14px;
          color: #4cae4f;
          cursor: pointer;
          margin-top: 20px;
          border-top: 1px solid #32ad66;
          padding-top: 15px;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
          
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
        margin-bottom: 10px;
        // border-radius: 5px;
        border-left: 4px solid #4cae4f;
        background-color: #f5f5f5;
        
        .waiting-title {
          font-weight: bold;
          color: #333;
          font-size: 16px;
        }
        
        .waiting-count {
          color: #999;
          font-size: 14px;
        }
      }
      
      .waiting-items {
        .waiting-item {
          height: 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          margin-bottom: 10px;
          background-color: white;
          cursor: pointer;
          border-radius: 5px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          // border-left: 3px solid #4cae4f;
          
          &:hover {
            background-color: #f9f9f9;
          }
          
          .item-left {
            .patient-name {
              font-size: 18px;
              color: #333;
              font-weight: bold;
              margin-bottom: 8px;
            }
            
            .initiator {
              font-size: 14px;
              color: #999;
            
              .orange-text {
                color: #f5a623;
              font-weight: bold;
              }
            }
          }
          
          .item-right {
            color: #ccc;
            font-size: 18px;
            padding-right: 5px;
          }
        }
        
        .view-more {
          text-align: center;
          padding: 15px;
          color: #999;
          font-size: 14px;
          // background-color: white;
          cursor: pointer;
          margin-top: 5px;
          
          &:hover {
            color: #4cae4f;
          }
        }
        
        .empty-waiting {
          text-align: center;
          padding: 20px;
          color: #999;
          font-size: 14px;
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

      .join-btn {
        background-color: #e3f2fd;
        color: #2196f3;
        border: 1px solid #bbdefb;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        
        &:hover {
          background-color: #bbdefb;
        }
      }

      .write-btn {
        background-color: #fff3e0;
        color: #ff9800;
        border: 1px solid #ffe0b2;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        
        &:hover {
          background-color: #ffe0b2;
        }
      }

      .reject-btn {
        background-color: #ffebee;
        color: #f44336;
        border: 1px solid #ffcdd2;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        
        &:hover {
          background-color: #ffcdd2;
        }
      }
      
      .accept-btn {
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
      
      .cancel-btn {
        background-color: #f5f5f5;
        color: #757575;
        border: 1px solid #e0e0e0;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        
        &:hover {
          background-color: #e0e0e0;
        }
      }
      
      .delete-btn {
        background-color: #ffebee;
        color: #f44336;
        border: 1px solid #ffcdd2;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        
        &:hover {
          background-color: #ffcdd2;
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
    color: #df4545;
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

.consultation-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.image-item {
  width: 80px;
  height: 80px;
  margin-right: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:after {
    content: "暂无图片";
    color: #999;
    font-size: 12px;
  }
}
</style>

<style>
/* 自定义弹窗样式 */
.consultation-confirm-dialog {
  width: 350px;
  border-radius: 4px;
}

.consultation-confirm-dialog .el-message-box__header {
  padding: 10px;
  background-color: #fff;
}

.consultation-confirm-dialog .el-message-box__title {
  color: #333;
  font-size: 16px;
  line-height: 24px;
}

.consultation-confirm-dialog .el-message-box__content {
  padding: 20px;
  background-color: #f9fffa;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.consultation-confirm-dialog .el-message-box__btns {
  padding: 10px 20px;
}

.consultation-confirm-dialog .el-button--primary {
  background-color: #4cae4f;
  border-color: #4cae4f;
  width: 100%;
}

.consultation-confirm-dialog .el-button--primary:hover,
.consultation-confirm-dialog .el-button--primary:focus {
  background-color: #449d48;
  border-color: #449d48;
}

/* 会诊意见按钮样式 */
.consultation-action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 15px;
  gap: 20px;
}

.submit-preview-btn, .generate-report-btn {
  padding: 10px 25px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  color: #fff;
}

.submit-preview-btn {
  background-color: #4cae4f;
}

.submit-preview-btn:hover {
  background-color: #449d48;
}

.generate-report-btn {
  background-color: #fff;
  color: #666;
  border: 1px solid #ddd;
}

.generate-report-btn:hover {
  background-color: #f5f5f5;
}

/* 会诊意见预览样式 */
.consultation-opinion-preview {
  padding: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background-color: #f9fffa;
}

.consultation-opinion-preview h3 {
  font-size: 16px;
  font-weight: bold;
  color: #4cae4f;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
  margin-top: 0;
  margin-bottom: 10px;
  text-align: center;
}

.opinion-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  padding: 15px;
  border-radius: 4px;
  background-color: #fff;
  min-height: 100px;
}

/* 提交会诊意见链接样式 */
.submit-opinion-link {
  color: #4cae4f;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
  cursor: pointer;
  border-top: 1px dashed #e8e8e8;
  padding-top: 5px;
}

.submit-opinion-link:hover {
  color: #449d48;
  text-decoration: underline;
}

/* 高亮效果 */
.highlight-section {
  animation: highlight-pulse 1.5s ease-in-out 2;
}

@keyframes highlight-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 174, 79, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(76, 174, 79, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 174, 79, 0);
  }
}
</style>

<style scoped>
/* 添加文件名称样式 */
.file-name {
  font-size: 12px;
  color: #606266;
  text-align: center;
  margin-top: 5px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 优化文件预览样式 */
.file-preview {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.file-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-delete {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  z-index: 10;
}

.file-delete:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

/* 上传区域样式 */
.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.upload-item {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.upload-placeholder i {
  font-size: 28px;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 10px;
}
</style>



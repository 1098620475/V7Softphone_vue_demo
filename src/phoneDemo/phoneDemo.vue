<!--
 * @Author: Wangtao
 * @Date: 2021-02-24 15:23:54
 * @LastEditors: Wangtao
 * @LastEditTime: 2021-03-01 18:15:25
-->
<template>
  <div class="phone-bar">
    <div class="peerStatus">
      <span id="phoneAgentStatus">{{ currentStatusName }}</span>
      <span class="softphone_timer">
        <phoneBarTimer ref="phoneBarTimeRef" />
      </span>
    </div>
    <div class="callStatus">
      <el-input
        v-model="dialoutNumber"
        style="width: 180px; margin-right: 10px"
        placeholder="请输入外呼号码"
        @keyup.enter.native="keyDowndialout"
      />
      <div class="callBtnList">
        <el-button
          type="primary"
          :disabled="!isVisibleBtn('dialout')"
          @click="dialout"
        >外呼</el-button>
        <el-button
          type="primary"
          :disabled="!isVisibleBtn('hangup')"
          @click="hangup"
        >挂机</el-button>
        <el-button
          type="primary"
          :disabled="!isVisibleBtn('hold')"
          @click="holdOrUnHold('1')"
        >保持</el-button>
        <el-button
          type="primary"
          :disabled="!isVisibleBtn('holdcancel')"
          @click="holdOrUnHold('2')"
        >取消保持</el-button>
        <el-button
          type="primary"
          :disabled="!isVisibleBtn('mute')"
          @click="muteOrUnMute('1')"
        >静音</el-button>
        <el-button
          type="primary"
          :disabled="!isVisibleBtn('mutecancel')"
          @click="muteOrUnMute('2')"
        >取消静音</el-button>
        <el-button
          type="primary"
          :disabled="!isVisibleBtn('answer')"
          @click="accept"
        >接听</el-button>
      </div>
    </div>
    <div class="dtmf">
      <div class="dtmf-tit">webrtc拨号盘</div>
      <div class="dtmf-box">
        <el-button
          v-for="key in keyList"
          :key="key"
          type="primary"
          :disabled="!isVisibleBtn('key')"
          @click="sendDTMF(key)"
        >{{ key }}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import phoneBarTimer from './phoneBarTimes'
import V7Softphone from './V7Softphone'
import { Message } from 'element-ui'
let currentExtenType = ''
export default {
  name: 'PhoneDemo',
  components: {
    phoneBarTimer
  },
  data() {
    return {
      dialoutNumber: '',
      renderMap: {
        PSTN_INVALID: ['dialout'],
        PSTN_INCOMING_CALLING: ['hangup'],
        PSTN_DIALOUT_CALLING: ['hangup'],
        PSTN_INCOMING_RING: ['hangup'],
        PSTN_DIALOUT_RING: ['hangup'],
        PSTN_INCOMING_LINK: ['hangup', 'hold', 'mute'],
        PSTN_DIALOUT_LINK: ['hangup', 'hold', 'mute'],
        PSTN_INCOMING_MUTE: ['mutecancel'],
        PSTN_DIALOUT_MUTE: ['mutecancel'],
        PSTN_INCOMING_HOLD: ['holdcancel'],
        PSTN_DIALOUT_HOLD: ['holdcancel'],
        PSTN_INCOMING_ARRANGE: ['dialout'],
        PSTN_DIALOUT_ARRANGE: ['dialout'],
        //
        SIP_INVALID: ['dialout'],
        SIP_INCOMING_CALLING: ['hangup'],
        SIP_DIALOUT_CALLING: ['hangup'],
        SIP_INCOMING_RING: ['hangup'],
        SIP_DIALOUT_RING: ['hangup'],
        SIP_INCOMING_LINK: ['hangup', 'hold', 'mute'],
        SIP_DIALOUT_LINK: ['hangup', 'hold', 'mute'],
        SIP_INCOMING_MUTE: ['mutecancel'],
        SIP_DIALOUT_MUTE: ['mutecancel'],
        SIP_INCOMING_HOLD: ['holdcancel'],
        SIP_DIALOUT_HOLD: ['holdcancel'],
        SIP_INCOMING_ARRANGE: ['dialout'],
        SIP_DIALOUT_ARRANGE: ['dialout'],
        //
        WEBRTC_INVALID: ['dialout'],
        WEBRTC_INCOMING_CALLING: ['hangup'],
        WEBRTC_DIALOUT_CALLING: ['hangup'],
        WEBRTC_INCOMING_RING: ['hangup', 'answer'],
        WEBRTC_DIALOUT_RING: ['hangup'],
        WEBRTC_INCOMING_LINK: ['hangup', 'hold', 'mute', 'key'],
        WEBRTC_DIALOUT_LINK: ['hangup', 'hold', 'mute', 'key'],
        WEBRTC_INCOMING_MUTE: ['mutecancel'],
        WEBRTC_DIALOUT_MUTE: ['mutecancel'],
        WEBRTC_INCOMING_HOLD: ['holdcancel'],
        WEBRTC_DIALOUT_HOLD: ['holdcancel'],
        WEBRTC_INCOMING_ARRANGE: ['dialout'],
        WEBRTC_DIALOUT_ARRANGE: ['dialout']
      },
      currentStatus: 'PSTN_INVALID',
      currentStatusName: '空闲',
      keyList: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']
    }
  },
  mounted() {
    const query = this.$route.query
    const account = query.account
    const exten = query.exten
    const password = query.password
    const extenType = query.extenType
    currentExtenType = extenType
    window.V7Softphone = new V7Softphone({
      accountId: account,
      agentNumber: exten,
      password: password,
      debug: true,
      extenType: extenType,
      error: (error) => {
        if (error) {
          Message({
            message: error.message,
            type: 'error',
            duration: 5 * 1000
          })
          this.$router.push('/login')
        }
      },
      success: () => {

      }
    })
    window.V7Softphone.attachEvent({
      success: (msg) => {
        // this.$refs.phoneBarTimeRef.timerTypeChange({ timeType: 'timing', statusTime: 0 })
      },
      error: (error) => {
        console.error(error)
      },
      message: (res) => {
        const event = res.event
        console.log(res)
        if (res.type === 'kickOff') {
          Message({
            message: '您当前的会话已经失效,导致该问题的原因是别的座席使用相同的帐号登录了',
            type: 'error',
            duration: 5 * 1000
          })
          this.$router.push('/login')
          return
        } else if (res.type === 'callStatus') {
          this.currentStatusName = event.statusName
          const timeType = event.statusNumber === '5' ? 'countDown' : 'timing'
          if (event.statusTime) {
            this.timeRecording(timeType, event.statusTime)
          } else {
            this.timeRecording(timeType)
          }
        }
        this.currentStatus = this.getCurrentStatus(event.statusNumber, event.callType)
      }
    })
  },
  methods: {
    dialout() {
      if (!this.dialoutNumber) {
        Message({
          message: '请填写外呼号码',
          type: 'error',
          duration: 5 * 1000
        })
        return
      }
      if (window.V7Softphone) {
        window.V7Softphone.callApi.dialout({
          calleeNumber: this.dialoutNumber,
          success: function(res) {
            Message({
              message: '外呼成功',
              type: 'success',
              duration: 5 * 1000
            })
          },
          fail: function(error) {
            Message({
              message: error.message,
              type: 'error',
              duration: 5 * 1000
            })
          }
        })
      }
    },
    hangup() {
      if (window.V7Softphone) {
        window.V7Softphone.callApi.hangup({
          fail: function(error) {
            console.log(error, 'error')
          }
        })
      }
    },
    holdOrUnHold(type) {
      if (window.V7Softphone) {
        window.V7Softphone.callApi.holdOrUnHold({
          type: type,
          fail: function(error) {
            console.log(error, 'error')
          }
        })
      }
    },
    muteOrUnMute(type) {
      if (window.V7Softphone) {
        window.V7Softphone.callApi.muteOrUnMute({
          type: type,
          fail: function(error) {
            console.log(error, 'error')
          }
        })
      }
    },
    accept() {
      window.V7Softphone.webPhoneApi.accept()
    },
    sendDTMF(key) {
      window.V7Softphone.webPhoneApi.sendDTMF(key)
    },
    keyDowndialout(event) {
      if (event.keyCode === 13) {
        this.dialout()
      }
    },
    isVisibleBtn(type) {
      if (this.currentStatus) {
        return this.renderMap[this.currentStatus] && this.renderMap[this.currentStatus].indexOf(type) > -1
      }
    },
    getCurrentStatus(statusNumber, type) {
      const callType = type ? '_' + type.toUpperCase() : ''
      let statusName = currentExtenType + '_INVALID'
      switch (statusNumber) {
        case '0':
          statusName = currentExtenType + '_INVALID'
          break
        case '1':
          statusName = currentExtenType + callType + '_BUSY'
          break
        case '2':
          statusName = currentExtenType + callType + '_CALLING'
          break
        case '3':
          statusName = currentExtenType + callType + '_RING'
          break
        case '4':
          statusName = currentExtenType + callType + '_LINK'
          break
        case '5':
          statusName = currentExtenType + callType + '_ARRANGE'
          break
        case '6':
          statusName = currentExtenType + callType + '_HOLD'
          break
        case '7':
          statusName = currentExtenType + callType + '_MUTE'
          break
        default:
          statusName = currentExtenType + callType + '_BUSY'
          break
      }
      return statusName
    },
    /**
     * 控制计时器
     * @param {string} type timing 正计时 or countDown 倒计时
     * @param {?string} timestamp 时间戳 从哪个时间开始记时 默认为函数执行时间
     */
    timeRecording(type, timestamp) {
      let second = 0
      if (timestamp) {
        const beginDate = new Date(timestamp)
        const endDate = new Date()
        const diff = endDate.getTime() - beginDate.getTime()
        second = diff / 1000
      }
      this.$refs.phoneBarTimeRef.timerTypeChange({ timeType: type, statusTime: second })
    }
  }
}
</script>

<style lang="scss" scoped>
.phone-bar {
  margin: 30px;
}
.peerStatus {
  margin-bottom: 10px;
  > span {
    margin-right: 10px;
  }
}
.callStatus {
  display: flex;
}
.callBtnList {
  display: flex;
}
.dtmf {
  margin-top: 20px;
}
.dtmf-box {
  width: 200px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-top: 10px;
  .el-button {
    margin: 0 10px 10px 0px;
  }
}
</style>
